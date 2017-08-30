import csv
import datetime
import requests
import jsonpickle
from subprocess import call


class DefenseData(object):
    EXCLUDED = ["", "player", "pts", "rank", "yds allowed", "position"]
    KEYS = {
        "scks": "sacks",
        "safts": "safety",
        "fum": "fumble_rec",
        "deftd": "def_td"
    }

    def __init__(self, csv_row):
        self.pos = "DST"
        name = csv_row.pop("Player").split(", ")
        self.last_name = name[0]
        self.first_name = name[1]

        for k, v in csv_row.iteritems():
            key = self.get_key(k.lower())
            if key not in self.EXCLUDED:
                setattr(self, key, v)

    def get_key(self, key):
        if key in self.KEYS:
            return self.KEYS[key]
        return key


class PlayerData(object):
    EXCLUDED = ["", "fpts", "player",
                "rush_att", "pass_att", "pass_att", "pass_cmp",
                "rec_att", "att", "comp"]
    MAPPING = {
        "fum lost": "fumbles",
        "rush yds": "rush_yds",
        "rush tds": "rush_tds",
        "int": "pass_ints",
        "pass tds": "pass_tds",
        "pass yds": "pass_yds",
        ">= 300yds": "pass_300+",
        "rec tds": "rec_tds",
        "rec yds": "rec_yds",
        ">= 100yds": "field_100+",  # rush or rec.
        "fgm": "fgs",
        "xpm": "xpt",
        "kick ret yds": "ret_yds",
    }

    def __init__(self, row, position):
        self.team = ""
        self.pos = position
        self.first_name = self.last_name = "INVALID"
        self.load_from_row(row)

    def load_from_row(self, row):
        name = row.pop("player").split(", ")
        self.first_name = name[1].strip()
        self.last_name = name[0].strip()
        for k, v in row.iteritems():
            if k in self.EXCLUDED:
                continue
            key = self.MAPPING[k] if k in self.MAPPING else k
            setattr(self, key, v)

    def __repr__(self):
        return ','.join([self.first_name, self.last_name,
                         self.pos, self.team])

    def __str__(self):
        return self.__repr__()


class FantasySharksScraper(object):
    URL = "http://www.fantasysharks.com/apps/bert/forecasts/projections.php"
    PARAMS = {
        "csv": 1,
        "Sort": "",
        "Segment": 586,
        "scoring": 1,
        "League": "",
        "uid": 4,
        "uid2": "",
        "printable": ""
    }
    HEADERS = {
        'user-agent':  'Mozilla/5.0 (Linux; <Android Version>; <Build Tag etc.>) AppleWebKit/<WebKit Rev> (KHTML, like Gecko) Chrome/<Chrome Rev> Mobile Safari/<WebKit Rev>'
    }
    POSITIONS = {
        "1": "QB",
        "2": "RB",
        "4": "WR",
        "5": "TE",
        "6": "DST",
        "7": "K",
    }

    def get_csv(self, pos):
        params = self.PARAMS.copy()
        params["Position"] = pos
        print "Fetching url: {} for position {}".format(self.URL, pos)

        r = requests.get(self.URL, params=params, headers=self.HEADERS)
        if r and r.text:
            return r.text.split("\n")
        raise ValueError("no data for {p}".format(p=self.POSITIONS[pos]))

    def scrape_all(self):
        players_by_position = {}
        for param, position in self.POSITIONS.items():
            raw_data = self.get_csv(param)
            data = self.get_data(raw_data, position)
            players_by_position[position] = data
            print "Finished with {}".format(position)
        return players_by_position

    def strip_keys(self, row):
        vals = {}
        for k, v in row.items():
            vals[k.strip().lower()] = v.strip()
        return vals

    def get_data(self, data, position):
        reader = csv.DictReader(data)
        if position == "DST":
            return [DefenseData(row) for row in reader]
        else:
            return [PlayerData(self.strip_keys(row), position)
                    for row in reader]

if __name__ == "__main__":
    s = FantasySharksScraper()
    data = s.scrape_all()
    update = str(datetime.date.today())
    output_file = 'app/data/player_data_{}.js'.format(update)
    json = jsonpickle.encode(data, unpicklable=False)
    outf = open(output_file, 'w')
    outf.write("var PLAYER_POINTS=")
    outf.write(json)
    outf.write(";")
    outf.close()
    call(['cp', output_file, 'app/data/latest.js'])
