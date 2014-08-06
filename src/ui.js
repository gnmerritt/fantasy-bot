dust.loadSource(dust.compile("<div>Name: {name}</div><div><a href='http://{HOST}/draft/{draft_id}'>Draft Page</a></div>",
                             "team"));

dust.loadSource(dust.compile(
    "<table><th>Pick #<th>Starts<th>Expires"
  + "{#mine}<tr data-id='{id}' {?active}class='active'{/active}>"
  + "<td>{pick_number}<td>{starts.relative}<td>{expires.relative}"
  + "</tr>{/mine}</table>",
    "pickList"));

dust.loadSource(dust.compile(
    "<table class='potential'><tr class='head'><th>Rank<th>Name<th>Team<th>Position<th>Points<th>VORP<th>ID{#players}"
  + "<tr data-id='{id}' data-pos='{pos}' class='{?id}hasId{/id}{?taken} taken{/taken} {?free} free{/free}'><td>{$idx}<td class='n'>{first_name} {last_name}<td>{team}<td>{pos} ({pos_rank})<td>{points}<td>{vorp}<td>{id}</tr>{/players}</table>",
                            "potentials"));

dust.loadSource(dust.compile("<table><tr><th>Name<th>Position<th>ID<th>API Link{#players}<tr data-pos='{fantasy_position}'><td>{first_name} {last_name}<td>{fantasy_position}<td>{id}<td>{?url}<a href='{url}'>Found</a>{:else}Not found{/url}</tr>{/players}</table>",
                            "drafted"));

dust.loadSource(dust.compile("{#configs}<option value='{name}' {?selected}selected='true'{/selected}>{name}</option>{/configs}",
                             "configs"));

dust.loadSource(dust.compile("{#draft}<h2>{name}</h2><ul><li>Start time: {draft_start.str}</li><li>Time per pick: {time_per_pick_s}</li><li>Roster: {#roster}{description} ({slots} slots){/roster}</li></ul>{/draft}",
                            "draft"));

dust.loadSource(dust.compile(
    "<div class='manualBtn'>"
  + "<span class='draft'>Draft</span><span class='remove'>Remove</span><span class='close'>Close</span>"
  + "</div>"
    , "manualPopup"));
