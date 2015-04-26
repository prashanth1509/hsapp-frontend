# CollabHunt frontend

## Usage

Copy the bookmarklet in https://github.com/prashanth1509/hsapp-frontend/bookmarklet

```
javascript:(function(){window.launchCollab = function(e){ e.preventDefault(); var user=prompt("Username?"); var pid=window.location.href.split("?")[0].split("/").pop(); window.location="http://hsapp-backend.herokuapp.com/?pid="+pid+"&username="+user;}; $(".svg-path").click(function(){  window.setTimeout(function(){$(".actions-pane").not(".done").append('<div class="btn block"><i class="icon icon-shortlist"></i><a href=# onclick="javascript:launchCollab(event)" class="text">Collaborate</span></div>').addClass("done"); },900); });})();
```

and save it.

Visit any search page on housing.com and click bookmark
You will get an option "Collborate" under Add_To_Shortlist, clicking on it will start collaboration app.

Checkout  https://github.com/prashanth1509/hasapp-android and build and install apk.

Use collaboration rooms to exchange research data and publish them too :)

