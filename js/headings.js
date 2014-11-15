var subHeadings = $("h2[id]").map(function () {
  return "<li><a href='#" + $(this).attr("id") + "'>" + $(this).text() + "</a></li>";
}).toArray();

if (subHeadings.length) {
  var subNav = "<ul class='nav'>" + subHeadings.join("\n") + "</ul>";
  $('.bs-docs-sidenav > li.active').append(subNav);
}

$("h2[id],h3[id],h4[id]").each(function () {
  var $heading = $(this);
  var $link = $("<a href='#" +  $heading.attr("id") + "' class='hash-link' style='display:none'>#</a>");

  $heading.append($link);

  $heading.hover(function () {
    $link.show();
  }, function () {
    $link.hide();
  });
});