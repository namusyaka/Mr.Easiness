/*******************************************************************************
 * Mr.Easiness                                                                 *
 * - This script is bookmarklet.                                               *
 * - This script can't be used outside the 2ch and the same format source page.*
 * - It's easy for you to together the threads.                                *
 * - Licensed under the MIT License.                                           *
 *******************************************************************************
**/

(function () {

  function regexpEscape(str) {
    return str.replace(/([\^\$\\\.\*\+\?\(\)\[\]\{\}\|])/g, "\\$1");
  }

  var d = document, tID = (new Date).getTime().toString(36);
  var elementCache = {}, $ = function (id) {
    return elementCache[id] ? elementCache[id] : elementCache[id] = d.getElementById(id);
  };
  var thread = d.getElementsByTagName("dl")[0];
  with (thread.insertBefore(d.createElement("dt"), thread.firstChild).style)
    height = "10px",
    display = "none";
  var dummy = d.createElement("div");
  with (d.body.appendChild(dummy).style)
    display = "none",
    width = "300px", height = "100px",
    position = "fixed",
    overflow = "auto",
    border = "1px dotted #000",
    backgroundColor = "#fff",
    zIndex = "2";
  d.body.style.backgroundColor = "#fff";

  var selectedElement = {}, changeSelectedState = function () {
    if (selectedElement[this.resNum]) {
      this.style.border = "0";
      delete selectedElement[this.resNum];
      $("resNum").value = $("resNum").value.replace(
        new RegExp("(^|,)" + this.resNum + "(,|$)"),
        function (s, s1, s2) { return s1 && s2 ? "," : ""; }
      );
    } else {
      this.style.border = "3px solid #000";
      selectedElement[this.resNum] = this;
      $("resNum").value = $("resNum").value + ($("resNum").value ? "," : "") + this.resNum;
    }
  }, deselect = function () {
    for (var i in selectedElement)
      selectedElement[i].style.border = "0";
    selectedElement = {};
    $("resNum").value = "";
  };

  var dragFlag = 0, dropElement;
  var mousedown = function () {
    dragFlag = 1;
    dropElement = null;
    dummy.innerHTML = $("resNum").value.replace(/(^|,)/g, "$1 >>");
    d.body.id = "drag";
  }, mouseover = function () {
    if (dragFlag) {
      if (dropElement)
        dropElement.style.borderBottom = "";
      dropElement = this;
      dropElement.style.borderBottom = "3px solid #f00";
    }
  };
  d.body.onmousemove = function (e) {
    if (!$("resNum").value)
      return dragFlag = 0;
    if (dragFlag)
      with (dummy.style)
        thread.firstChild.style.display = display = "block",
        top = e.clientY + 5 + "px",
        left = e.clientX + 5 + "px";
  };
  d.body.onmouseup = function () {
    if (dragFlag) {
      dragFlag = 0;
      thread.firstChild.style.display = dummy.style.display = "none";
      if (!dropElement)
        return;
      d.body.id = dropElement.style.borderBottom = "";
      var ref = dropElement;
      for (var i in selectedElement) {
        ref = thread.insertBefore(selectedElement[i].previousSibling, ref.nextSibling);
        ref = thread.insertBefore(selectedElement[i], ref.nextSibling);
      }
    }
  };

  var dds = d.getElementsByTagName("dd"), replaceList = {};
  for (var i = 0; i < dds.length; ++i) {
    if (/(^ sssp:\/\/\S+ <br>|<a name="tag[^>]+>\s<\/a>$)/.test(dds[i].innerHTML))
      dds[i].innerHTML = dds[i].innerHTML.replace(/(^ sssp:\/\/\S+ <br>|<a name="tag[^>]+>\s<\/a>$)/g, "");
    if (/[^h>]ttp:\/\//.test(dds[i].innerHTML))
      dds[i].innerHTML = dds[i].innerHTML.replace(/([^h>])ttp:\/\/([^\s　]+)/g, '$1<a href="http://$1">ttp://$2</a>');
    if (/^\s*<[^>]+>&gt;&gt;(\d+)/.test(dds[i].innerHTML)) {
      var anchor = RegExp.$1;
      if (!replaceList[anchor])
        replaceList[anchor] = [];
      replaceList[anchor].push({dd : dds[i], dt : dds[i].previousSibling});
    }
    dds[i].onmousedown = mousedown;
    dds[i].onmouseover = mouseover;
    dds[i].onclick = changeSelectedState;
  }

  for (var i = 0; i < d.links.length; ++i) {
    if (/^http:\/\/ime\.nu\/(.+)$/.test(d.links[i]))
      d.links[i].href = "http://" + RegExp.$1;
    else if (/^&gt;&gt;(\d+)$/.test(d.links[i].innerHTML)) {
      d.links[i].href = "javascript:void(location.href='#a" + tID + "_" + RegExp.$1 + "')";
      d.links[i].target = "";
    }
  }

  var dts = d.getElementsByTagName("dt");
  var dtClick = function () {
    this.firstChild.checked = !this.firstChild.checked;
  }, checkClick = function (e) {
    e = e || event;
    if (e.stopPropagation)
      e.stopPropagation();
    else
      e.cancelBubble = true;
  };
  var check = d.createElement("input");
  check.type = "checkbox";
  for (var i = 1; i < dts.length; ++i) {
    dts[i].innerHTML = dts[i].innerHTML.replace(/\s+(?:<[^>]+>[^<]+<\/a>)?\s*$/, "");
    if (/^(?:<[^>]+><[^>]+>)?<[^>]+><[^>]+>(?:<b>)?/.test(dts[i].innerHTML))
      dts[i].innerHTML = dts[i].innerHTML.replace(/^(?:<[^>]+><[^>]+>)?<[^>]+><[^>]+>(?:<b>)?(\d+)(?:<\/b>)?<[^>]+><[^>]+>/, "$1");
    if (/^(\d+)/.test(dts[i].innerHTML)) {
      var resNum = RegExp.$1;
      dts[i].insertBefore(d.createElement("a"), dts[i].firstChild).name = "a" + tID + "_" + resNum;
      if (replaceList[resNum])
        replaceList[resNum].refElement = dts[i];
      dts[i].nextSibling.resNum = resNum;
    }
    with (dts[i].insertBefore(check.cloneNode(false), dts[i].firstChild).style)
      width = height = "1.5em";
    //.onclick = checkClick;
    //dts[i].onclick = dtClick;
  }
  thread.firstChild.onmouseover = mouseover;

  for (var i in replaceList) if (i !== "1")
    for (var j = 0; j < replaceList[i].length; ++j)
      if (replaceList[i].refElement) {
        thread.insertBefore(replaceList[i][j].dd, replaceList[i].refElement.nextSibling.nextSibling);
        thread.insertBefore(replaceList[i][j].dt, replaceList[i][j].dd);
      }

  var control = d.createElement("div");
  with (control.style)
    position = "fixed",
    top = "10px",
    right = "10px",
    zIndex = "2",
    padding = "5px",
    border = "1px solid #000",
    backgroundColor = "#fff";

  control.innerHTML='<ul style="list-style-type:none">\
<li style="float:left"><input type="button" value="全チェック" id="checkAll">\
<li style="float:left"><input type="button" value="全チェック解除" id="uncheckAll">\
<li style="float:left"><input type="button" value="チェックしてないレスを消す" id="deleteUncheck">\
</ul>\
<hr style="clear:both">\
<ul><li><input type="button" value="レスの選択を解除" id="deselect"></ul>\
<ul>\
<li><label><input type="radio" name="selectedRes" checked>レス番号</label><input type="text" id="resNum" readonly>の\
<li><label><input type="radio" name="selectedRes" id="selectedRes">全部の</label>\
</ul>\
<p><select id="parts"><option>本文</option><option>ID</option><option>ヘッダ</option></select>のスタイルを変更\
<ul>\
<li>色 #<input type="text" id="fontColor" value="000000"><br>\
<input type="button" value="黒" id="colorBlack">\
<input type="button" value="赤" id="colorRed">\
<input type="button" value="緑" id="colorGreen">\
<input type="button" value="青" id="colorBlue">\
<li>サイズ<input type="text" id="fontSize" value="12">px\
<li><label><input type="checkbox" id="fontWeight">太字</label>\
<li>font-family :<input type="text" id="fontFamily" value="">\
</ul>\
<p><input type="button" value="変更" id="changeStyle">\
<hr>\
<p><label><input type="checkbox" id="isAAThread">AAスレッド用クラスを付加する</label>\
<p><input type="button" value="HTMLソース表示" id="showSource">';

  d.body.appendChild(control);


  $("checkAll").onclick = function () {
    for (var i = 1; i < dts.length; ++i)
      if (!dts[i].style.display)
        dts[i].firstChild.checked = true;
  };

  $("uncheckAll").onclick = function () {
    for (var i = 1; i < dts.length; ++i)
      dts[i].firstChild.checked = false;
  };

  $("deleteUncheck").onclick = function () {
    for (var i = 1; i < dts.length; ++i)
      if (!dts[i].firstChild.checked)
        dts[i].style.display = dts[i].nextSibling.style.display = "none";
  };

  $("deselect").onclick = deselect;

  $("colorBlack").onclick = function () {
    $("fontColor").value = "000000";
  };
  $("colorBlack").style.color = "#000";

  $("colorRed").onclick = function () {
    $("fontColor").value = "ff0000";
  };
  $("colorRed").style.color = "#f00";

  $("colorGreen").onclick = function () {
    $("fontColor").value = "00ff00";
  };
  $("colorGreen").style.color = "#0f0";

  $("colorBlue").onclick = function () {
    $("fontColor").value = "0000ff";
  };
  $("colorBlue").style.color = "#00f";

  $("changeStyle").onclick = function () {

    function changeStyle(element) {
      with (element.style)
        fontFamily = $("fontFamily").value,
        color = $("fontColor").value,
        fontSize = $("fontSize").value,
        fontWeight = $("fontWeight").checked ? "bold" : "normal";
    }

    if ($("selectedRes").checked) switch ($("parts").selectedIndex) {
      case 0:
        for (var i = 0; i < dds.length; ++i)
          changeStyle(dds[i]);
        break;
      case 1:
        alert("意味がないコマンドです");
        break;
      case 2:
        for (var i = 0; i < dts.length; ++i)
          changeStyle(dts[i]);
    } else {
      if ($("resNum").value) switch ($("parts").selectedIndex) {
      case 0:
        for (var i in selectedElement)
          changeStyle(selectedElement[i]);
        break;
      case 1:
        for (var j in selectedElement) if (/ID:(.{8,9})(<\/span>)?$/.test(selectedElement[j].previousSibling.innerHTML)) {
          var reg = new RegExp("ID:(" + regexpEscape(RegExp.$1) + ")(<\\/span>)?$");
          for (var i = 0; i < dts.length; ++i)
            if (reg.test(dts[i].innerHTML)) {
              if (!RegExp.$2) {
                  dts[i].lastChild.nodeValue = dts[i].lastChild.nodeValue.slice(0, -3 - RegExp.$1.length);
                  dts[i].appendChild(d.createElement("span")).innerHTML = "ID:" + RegExp.$1;
                  dts[i].idElement = dts[i].lastChild;
              }
              changeStyle(dts[i].idElement);
            }
        }
        break;
      case 2:
        for (var i in selectedElement)
          changeStyle(selectedElement[i].previousSibling);
      } else
        alert("何も選択されてないです");
    }

  };

  $("showSource").onclick = function () {
    deselect();
    var source = thread.cloneNode(true);
    var checks = source.getElementsByTagName("input");
    source.removeChild(source.firstChild);
    while (checks.length) {
      var dt = checks[0].parentNode, checked = checks[0].checked;
      dt.removeChild(checks[0]);
      if (!checked) {
        source.removeChild(dt.nextSibling);
        source.removeChild(dt);
      }
    }

    var sd = open("about:blank", "_blank").document;
    with (sd)
      open(), write("<title>HTMLソース</title><style>*{margin:0;padding:0}textarea{width:100%;height:100%}</style><p>"), close();
    with (sd.body.appendChild(sd.createElement("textarea")))
      value = "<dl" + ($("isAAThread").checked ? ' class="aathread">' : ">") + source.innerHTML + "</dl>",
      readOnly = true,
      onclick = function () { this.select(); };
  };

  gcache = control;
})();

(function() {
var d = document,
$c = function(e) {
  return d.createElement(e)
},
dl = d.getElementsByTagName('dl')[0], 
button = $c('button'),
button2 = $c('button'),
button3 = $c('button'), 
content = $c('input'), 
cache = gcache;
content.id = 'content', button.innerHTML = 'IDで抽出',button2.innerHTML = '画像URL抽出', button3.innerHTML = 'YoutubeURLを動画に変換';
cache.appendChild(button), cache.appendChild(content), cache.appendChild(button2),cache.appendChild(button3);

button.onclick = function() {
  var s = d.getElementById('content').value, e = d.getElementsByTagName('dt'),
  i = 1;
  while(i<e.length)if(e[i++].innerHTML.indexOf(s)<0)
    with(e[0].parentNode)
   removeChild(e[--i].nextSibling),removeChild(e[i])
};

button2.onclick = function() {
  var img_array = dl.innerHTML.match(/(h?ttps?\:\/\/[^\s<>]+?\.)(jpg|jpeg|gif|png|bmp)/ig),
  hash = {};
  if(!img_array)
    return alert("見つからなかった");
  for(var i=0; i < img_array.length; ++i) {
    if(!hash[img_array[i]]) {
      if(img_array[i][0] !== 'h')
        img_array[i] = 'h' + img_array[i];
      document.write('<img src="' + img_array[i] + '">');
      hash[img_array[i]] = 1;
    }
  }
  document.close();
};

button3.onclick = function() {
  var s = />h?ttp\:\/\/www\.youtube\.com\/watch\?v\=.+?<|>h?ttp\:\/\/youtu.be\/.+?</i,
  a = /(?:<a .+?>h?ttp\:\/\/www\.youtube\.com\/watch\?v\=(.+?)<\/a>|<a .+?>h?ttp\:\/\/youtu.be\/(.+?)<\/a>)/i
  e = d.getElementsByTagName('dd'), i = 0;
  while(i < e.length){if(s.test(e[i].innerHTML))
  e[i].innerHTML = e[i].innerHTML.replace(a, function(){return '<object width="425" height="350"><param name="movie" value="http://youtube.com/v/'+ (arguments[1] || arguments[2]) +'&amp\;feature=youtube_gdata_player"></param><param name="allowFullScreen" value="true"></param><embed src="http://youtube.com/v/'+ (arguments[1] || arguments[2]) +'&amp\;feature=youtube_gdata_player" type="application/x-shockwave-flash" allowfullscreen="true" width="425" height="350"></embed></object>'});
  ++i;
  }
  /*var youtube = dl.innerHTML.match(/>http\:\/\/www\.youtube\.com\/watch\?v\=(.+?)</ig);
  if(!(youtube instanceof Array)) {
    document.write('<iframe width="425" height="349" src="http://www.youtube.com/embed/'+youtube.substr(32, youtube.length-1)+'" frameborder="0" allowfullscreen></iframe>');
    return
  }
  for(var i=0; i < youtube.length; ++i) {
    var jf = youtube[i].replace(/>http\:\/\/www\.youtube\.com\/watch\?v=(.+?)(\&amp\;.*)?</, 'http://youtube.com/v/$1&amp\;feature=youtube_gdata_player');
    document.writeln('<object width="425" height="350"><param name="movie" value="'+jf+'"></param><param name="allowFullScreen" value="true"></param><embed src="'+jf+'" type="application/x-shockwave-flash" allowfullscreen="true" width="425" height="350"></embed></object>');
  }
  document.close()*/
}
})()