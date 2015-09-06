import csv
import requests
import jsonpickle


class PlayerData(object):
    EXCLUDED = ["", "fpts", "player name",
                "rush_att", "pass_att", "pass_att", "pass_cmp",
                "rec_att"]

    def __init__(self, row, position):
        self.team = ""
        self.pos = position
        self.first_name = self.last_name = "INVALID"
        self.load_from_row(row)

    def load_from_row(self, row):
        name = row.pop("player name").split(" ")
        self.first_name = name[0]
        self.last_name = name[1]
        for k, v in row.iteritems():
            if k not in self.EXCLUDED:
                setattr(self, k, v)

    def __repr__(self):
        return ','.join([self.first_name, self.last_name,
                         self.pos, self.team])

    def __str__(self):
        return self.__repr__()


class FantasyProsScraper(object):
    BASE_URL = "http://www.fantasypros.com/nfl/rankings/" \
        + "{pos}-cheatsheet.php?export=xls&week=draft"
    POSITIONS = ['QB', 'RB', 'WR', 'TE', 'K']

    def get_data(self, position):
        url = self.BASE_URL.format(pos=position.lower())
        print "  grabbing {}".format(url)
        r = requests.get(url)
        if r and r.text:
            return r.text.split("\n")
        return []

    def remove_header(self, data_table):
        for i, row in enumerate(data_table):
            if row.find(u'Player Name') == 0:
                return data_table[i:]
        return data_table

    def strip_keys(self, row):
        vals = {}
        for k in row.keys():
            v = row.pop(k)
            vals[k.strip().lower()] = v.strip().replace(",", "")
        return vals

    def scrape_position(self, data_table, position):
        data = self.remove_header(data_table)
        reader = csv.DictReader(data, delimiter='\t', quoting=csv.QUOTE_NONE)
        players = \
            [PlayerData(self.strip_keys(row), position) for row in reader]
        return self.clean_data(players)

    def clean_data(self, data):
        return [d for d in data if d.first_name != "INVALID"]

    def scrape_all(self):
        players_by_position = {}
        for pos in self.POSITIONS:
            data = self.get_data(pos)
            players_by_position[pos] = self.scrape_position(data, pos)
            print "Finished with {}".format(pos)
        return players_by_position


if __name__ == "__main__":
    s = FantasyProsScraper()
    update = "TODO"
    players = s.scrape_all()
    json = jsonpickle.encode(players, unpicklable=False)
    outf = open('data/player_data_{}.json'.format(update), 'w')
    outf.write("var PLAYER_POINTS=")
    outf.write(json)
    outf.write(";")
    outf.close()
