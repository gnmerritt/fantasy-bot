from bs4 import BeautifulSoup
import requests

class PlayerData:
    def __init__(self, row, position):
        self.team = ""
        self.pos = position.upper()
        self.name = "INVALID"
        self.points = 0
        self.__init_from_row(row)

    def __init_from_row(self, row):
        tds = row.find_all("td")
        if not tds:
            return
        name_link = tds[0].find("a")
        if name_link and name_link.contents:
            self.name = name_link.contents[0]
        team = tds[0].find("small")
        if team and team.contents:
            self.team = team.contents[0].replace('(', '').replace(')', '')

        points = tds[-1].contents[0]
        if points:
            self.points = points

    def __repr__(self):
        return ','.join([self.name, self.pos, self.team, self.points])
    def __str__(self):
        return self.__repr__()

class FantasyProsScraper:
    BASE_URL = "http://www.fantasypros.com/nfl/projections/{pos}.php"
    POSITIONS = ['QB', 'RB', 'WR', 'TE', 'K']

    def scrape_position(self, position):
        r = requests.get(self.BASE_URL.format(pos=position))
        html = r.text
        soup = BeautifulSoup(html, "html5lib")
        data_table = soup.find(id="data")

        data = []

        for row in data_table.find_all("tr"):
            if not row and row.find("td"):
                 continue
            data.append(PlayerData(row, position))

        return data

    def scrape_all(self):
        players = {}
        for pos in self.POSITIONS:
            players[pos] = self.scrape_position(pos)
        return players

    # TODO latest update timestamp

if __name__ == "__main__":
    pass
