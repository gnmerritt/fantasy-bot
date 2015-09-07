dust.loadSource(dust.compile("<div>Name: {name}</div><div><a href='http://{HOST}/draft/{draft_id}'>Draft Page</a></div>",
                             "team"));

dust.loadSource(dust.compile(
    "<table class='table table-rounded table-bordered table-striped'><th>Pick #<th>Starts<th>Expires"
  + "{#mine}<tr data-id='{id}' {?active}class='active'{/active}>"
  + "<td>{pick_number}<td>{starts.relative}<td>{expires.relative}"
  + "</tr>{/mine}</table>",
    "pickList"));

dust.loadSource(dust.compile(
    "<table class='potential table table-rounded table-bordered table-hover'><tr class='head'><th>Rank<th>Name<th>Team<th>Position<th>Points<th>VORP<th>VOPOS<th>ID{#players}"
  + "{^taken}<tr data-id='{id}' data-pos='{pos}' class='{?id}hasId{/id}{?free} free{/free}'><td>{$idx}"
  + "<td class='n'>{first_name} {last_name}<td>{team}<td>{pos} ({pos_rank})"
  + '<td>{@math key=points method="round" /}'
  + '<td>{@math key=vorp method="round" /}'
  + '<td>{@math key=vopos method="round" /}'
  + '<td>{id}</tr>'
  + "{/taken}{/players}</table>",
                            "potentials"));

dust.loadSource(dust.compile("<table class='table table-rounded table-bordered table-striped'><tr><th>Name<th>Position<th>ID{#players}<tr data-pos='{fantasy_position}'><td>{first_name} {last_name}<td>{fantasy_position}<td>{id}</tr>{/players}</table>",
                             "drafted"));

dust.loadSource(dust.compile("{#configs}<option value='{name}' {?selected}selected='true'{/selected}>{name}</option>{/configs}",
                             "configs"));

dust.loadSource(dust.compile("{#draft}<h2>{name}</h2><ul><li>Start time: {draft_start.str}</li><li>Time per pick: {time_per_pick_s}</li><li>Roster: {#roster}{description} ({slots} slots){/roster}</li></ul>{/draft}",
                            "draft"));

dust.loadSource(dust.compile(
    "<div>"
  + '<button type="button" class="draft btn btn-lg btn-primary">Draft</button>'
  + '<button type="button" class="remove btn btn-lg btn-default">Remove</button>'
  + '<button type="button" class="dismiss btn btn-lg btn-default">Close</button>'
  + "</div>"
    , "manualPopup"));

dust.loadSource(dust.compile(
    "<div>{first_name} {last_name}</div>"
  + "<div>#{pos_rank} {pos} ({value})</div>"
    , "playerPopup"));

$(document).ready(function() {
    // Keeps buttons in button groups active
    $('body').on('click', '.btn-group button', function(e) {
        $(this).addClass('active');
        $(this).siblings().removeClass('active');
    });
});
