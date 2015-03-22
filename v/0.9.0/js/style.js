setStyle(localStorage.getItem('style') || 'es6')

function setStyle(style) {
  $(".sample .btn." + style).addClass("active");
  $(".sample :not(.btn." + style + ")").removeClass("active");

  $(".sample .highlight[data-style='" + style + "']").show();
  $(".sample .highlight:not([data-style='" + style + "'])").hide();
  localStorage.setItem('style', style);
}

$('.sample .btn').click(function () {
  setStyle($(this).data().style);
});