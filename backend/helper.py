def findExtension(filename: str):
    pos = filename.rfind('.')
    if pos == -1 or pos == 0:
        return ''
    return filename[pos + 1:]