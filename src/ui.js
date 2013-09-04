dust.loadSource(dust.compile("<div>Name: {name}</div><div><a href='http://{HOST}/draft/{draft_id}'>Draft Page</a></div>",
                             "team"));

dust.loadSource(dust.compile("<ul>{#mine}<li><div>Pick #{pick_number}</div><span>Starts: {starts.str}</span> - <span>Expires: {expires.str}</span></li>{/mine}</ul>",
                             "pickList"));
