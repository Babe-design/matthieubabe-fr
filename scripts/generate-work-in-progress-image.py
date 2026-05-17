from __future__ import annotations

import math
import os
import random
import struct
import zlib


WIDTH = 1800
HEIGHT = 1200
OUTPUT = "public/images/work-in-progress.png"


def clamp(value: float) -> int:
    return max(0, min(255, int(value)))


def mix(a: tuple[int, int, int], b: tuple[int, int, int], t: float) -> tuple[int, int, int]:
    return tuple(clamp(a[i] + (b[i] - a[i]) * t) for i in range(3))


def png_chunk(kind: bytes, data: bytes) -> bytes:
    return (
        struct.pack(">I", len(data))
        + kind
        + data
        + struct.pack(">I", zlib.crc32(kind + data) & 0xFFFFFFFF)
    )


def write_png(path: str, width: int, height: int, rows: list[bytes]) -> None:
    raw = b"".join(b"\x00" + row for row in rows)
    payload = zlib.compress(raw, 9)
    image = (
        b"\x89PNG\r\n\x1a\n"
        + png_chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0))
        + png_chunk(b"IDAT", payload)
        + png_chunk(b"IEND", b"")
    )
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as file:
        file.write(image)


random.seed(23)

cream = (246, 241, 231)
paper = (226, 215, 198)
ink = (31, 25, 19)
moss = (40, 95, 79)
ochre = (178, 99, 49)
steel = (78, 103, 116)

rows: list[bytes] = []
for y in range(HEIGHT):
    row = bytearray()
    ny = y / HEIGHT
    for x in range(WIDTH):
        nx = x / WIDTH
        base = mix(cream, paper, 0.22 + 0.38 * nx + 0.12 * ny)

        desk_shadow = max(0.0, min(1.0, (nx - 0.48) * 1.8))
        color = mix(base, ink, desk_shadow * 0.52)

        diagonal = abs((ny - 0.08) - (nx * 0.64))
        if diagonal < 0.12:
            color = mix(color, moss, (0.12 - diagonal) * 2.8)

        warm_band = abs((ny - 0.72) - (nx * 0.28))
        if warm_band < 0.08:
            color = mix(color, ochre, (0.08 - warm_band) * 3.3)

        vertical_edge = abs(nx - 0.76)
        if vertical_edge < 0.012 and ny > 0.12:
            color = mix(color, steel, 0.38)

        horizontal_edge = abs(ny - 0.62)
        if horizontal_edge < 0.01 and nx > 0.5:
            color = mix(color, cream, 0.34)

        vignette = ((nx - 0.66) ** 2 + (ny - 0.45) ** 2) * 0.72
        color = mix(color, ink, max(0.0, vignette - 0.04))

        grain = random.randint(-8, 8)
        wave = math.sin((nx * 9.0 + ny * 4.0) * math.pi) * 4.0
        row.extend(clamp(channel + grain + wave) for channel in color)
    rows.append(bytes(row))

write_png(OUTPUT, WIDTH, HEIGHT, rows)
print(OUTPUT)
