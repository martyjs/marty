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