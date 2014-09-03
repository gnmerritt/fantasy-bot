import csv
import requests
import jsonpickle


class DefenseData(object):
    def __init__(self, csv_row):
        self.pos = "DST"
        name = csv_row.pop("Player").split(", ")
        self.last_name = name[0]
        self.first_name = name[1]
        self.team = csv_row.pop("Team")
        self.points = csv_row.pop("Pts")


class FantasySharksScraper(object):
    DEFENSE_CSV_URL = "http://www.fantasysharks.com/apps/bert/forecasts/projections.php?csv=1&Sort=&Segment=490&Position=6&scoring=11&uid=4"

    def get_csv(self):
        r = requests.get(self.DEFENSE_CSV_URL)
        if r and r.text:
            return r.text.split("\n")
        return []

    def get_defenses(self):
        reader = csv.DictReader(self.get_csv())
        return [DefenseData(row) for row in reader]

if __name__ == "__main__":
    s = FantasySharksScraper()
    defenses = s.get_defenses()
    json = jsonpickle.encode(defenses, unpicklable=False)
    outf = open('data/dst_latest.js', 'w')
    outf.write("PLAYER_POINTS['DST']=")
    outf.write(json)
    outf.write(";")
    outf.close()
