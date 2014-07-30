from bs4 import BeautifulSoup
import requests
import jsonpickle

class PlayerData(object):
    def __init__(self, row, position):
        self.team = ""
        self.pos = position.upper()
        self.name = "INVALID"
        self.points = "-1"
        self.load_from_row(row)

    def load_from_row(self, row):
        tds = row.find_all("td")
        if not tds:
            return
        name_link = tds[0].find("a")
        if name_link and name_link.contents:
            self.name = self.to_unicode(name_link.contents)
        team = tds[0].find("small")
        if team and team.contents:
            paren_team = self.to_unicode(team.contents)
            self.team = paren_team.replace('(', '').replace(')', '')

        points = self.to_unicode(tds[-1].contents)
        if points:
            self.points = points

    def to_unicode(self, bs4_contents):
        if bs4_contents:
            return unicode(bs4_contents[0])

    def __repr__(self):
        return ','.join([self.name, self.pos, self.team, self.points])
    def __str__(self):
        return self.__repr__()

class FantasyProsScraper(object):
    BASE_URL = "http://www.fantasypros.com/nfl/projections/{pos}.php"
    POSITIONS = ['QB', 'RB', 'WR', 'TE', 'K']

    def get_data(self, position):
        url = self.BASE_URL.format(pos=position)
        print "  grabbing {}".format(url)
        r = requests.get(url)
        html = r.text
        soup = BeautifulSoup(html, "html5lib")
        data_table = soup.find(id="data")
        return data_table

    def scrape_position(self, data_table, position):
        data = []
        for row in data_table.find_all("tr"):
            if not row and row.find("td"):
                 continue
            data.append(PlayerData(row, position))
        return data

    def scrape_all(self):
        players_by_position = {}
        for pos in self.POSITIONS:
            data = self.get_data(pos)
            players_by_position[pos] = self.scrape_position(data, pos)
            print "Finished with {}".format(pos)
        return players_by_position

    # TODO latest update timestamp

if __name__ == "__main__":
    s = FantasyProsScraper()
    players = s.scrape_all()
    json = jsonpickle.encode(players, unpicklable=False)
    outf = open('player_data.json', 'w')
    outf.write(json)
    outf.close()
