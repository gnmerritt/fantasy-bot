dust.loadSource(dust.compile("<div>Name: {name}</div><div><a href='http://{HOST}/draft/{draft_id}'>Draft Page</a></div>",
                             "team"));

dust.loadSource(dust.compile("<ul>{#mine}<li {?active}class='active'{/active}><div>Pick #{pick_number}</div><div>Starts: {starts.relative}</div><div>Expires: {expires.relative}</div></li>{/mine}</ul>",
                             "pickList"));

dust.loadSource(dust.compile("<table class='potential'><tr class='head'><td>Rank<th>Name<th>Position<th>ID<th>API Link{#players}<tr data-id='{id}'><td>{rank}<td>{first_name} {last_name}<td>{fantasy_position} ({pos_rank})<td>{id}<td>{?url}<a href='{url}'>Found</a>{:else}Not found{/url}</tr>{/players}</table>",
                            "potentials"));

dust.loadSource(dust.compile("<table><tr><th>Name<th>Position<th>ID<th>API Link{#players}<tr><td>{first_name} {last_name}<td>{fantasy_position}<td>{id}<td>{?url}<a href='{url}'>Found</a>{:else}Not found{/url}</tr>{/players}</table>",
                            "drafted"));
