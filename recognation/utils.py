
def generate_bi_grams():
    file = open('bi_grams', 'w')
    english = set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ .,-`#@")
    ukrainian = set("АаБбВвГгҐґДдЕеЄєЖжЗзИиІіЇїЙйКкЛлМмНнОоПпРрСсТтУуФфХхЦцЧчШшЩщЬьЮюЯяЫыЁёЭэ .,-`#@")
    digits = set("1234567890 ,.-+*xX#@")

    file.write('---english---\n')
    for x in english:
        for y in english:
            file.write('{}{}\n'.format(x, y))

    file.write('---ukrainian---\n')
    for x in ukrainian:
        for y in ukrainian:
            file.write('{}{}\n'.format(x, y))

    file.write('---digits---\n')
    for x in digits:
        for y in digits:
            file.write('{}{}\n'.format(x, y))