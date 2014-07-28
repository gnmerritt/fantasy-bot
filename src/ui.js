dust.loadSource(dust.compile("<div>Name: {name}</div><div><a href='http://{HOST}/draft/{draft_id}'>Draft Page</a></div>",
                             "team"));

dust.loadSource(dust.compile("<ul>{#mine}<li data-id='{id}' {?active}class='active'{/active}><div>Pick #{pick_number}</div><div>Starts: {starts.relative}</div><div>Expires: {expires.relative}</div></li>{/mine}</ul>",
                             "pickList"));

dust.loadSource(dust.compile("<table class='potential'><tr class='head'><td>Rank<th>Name<th>Position<th>ID<th>API Link{#players}<tr data-id='{id}' data-pos='{fantasy_position}'><td>{rank}<td class='n'>{first_name} {last_name}<td>{fantasy_position} ({pos_rank})<td>{id}<td>{?url}<a href='{url}'>Found</a>{:else}Not found{/url}</tr>{/players}</table>",
                            "potentials"));

dust.loadSource(dust.compile("<table><tr><th>Name<th>Position<th>ID<th>API Link{#players}<tr data-pos='{fantasy_position}'><td>{first_name} {last_name}<td>{fantasy_position}<td>{id}<td>{?url}<a href='{url}'>Found</a>{:else}Not found{/url}</tr>{/players}</table>",
                            "drafted"));

dust.loadSource(dust.compile("<ul class='order'>{#slots}<li>{name}</li>{/slots}</ul>",
                             "roster"));

dust.loadSource(dust.compile("{#configs}<option value='{name}' {?selected}selected='true'{/selected}>{name}</option>{/configs}",
                             "configs"));

dust.loadSource(dust.compile("{#draft}<h2>{name}</h2><ul><li>Start time: {draft_start.str}</li><li>Time per pick: {time_per_pick_s}</li><li>Roster: {#roster}{description} ({slots} slots){/roster}</li></ul>{/draft}",
                            "draft"));
