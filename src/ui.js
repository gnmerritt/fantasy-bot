dust.loadSource(dust.compile("<div>Name: {name}</div><div><a href='http://{HOST}/draft/{draft_id}'>Draft Page</a></div>",
                             "team"));

dust.loadSource(dust.compile("<ul>{#mine}<li {?active}class='active'{/active}><div>Pick #{pick_number}</div><span>Starts: {starts.str}</span> - <span>Expires: {expires.str}</span></li>{/mine}</ul>",
                             "pickList"));

dust.loadSource(dust.compile("<table><tr><th>Name<th>Position<th>ID<th>API Link{#players}<tr class='{?fantasy_team}taken{:else}free{/fantasy_team}'><td>{first_name} {last_name}<td>{fantasy_position}<td>{id}<td>{?url}<a href='{url}'>Found</a>{:else}Not found{/url}</tr>{/players}</table>",
                            "potentials"));

dust.loadSource(dust.compile("<table><tr><th>Name<th>Position<th>ID<th>API Link{#players}<tr><td>{first_name} {last_name}<td>{fantasy_position}<td>{id}<td>{?url}<a href='{url}'>Found</a>{:else}Not found{/url}</tr>{/players}</table>",
                            "drafted"));
