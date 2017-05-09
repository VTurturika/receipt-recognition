
def generate_bi_grams():
    file = open('bi_grams', 'w')
    all_chars = set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ" +
                    "АаБбВвГгҐґДдЕеЄєЖжЗзИиІіЇїЙйКкЛлМмНнОоПпРрСсТтУуФфХхЦцЧчШшЩщЬьЮюЯяЫыЁёЭэ" +
                    "1234567890 .,-+*`'#@")

    for x in all_chars:
        for y in all_chars:
            file.write('{}{}\n'.format(x, y))