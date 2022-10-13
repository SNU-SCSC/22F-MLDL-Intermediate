var suggestions = document.getElementById('suggestions');
var search = document.getElementById('search');

if (search !== null) {
  document.addEventListener('keydown', inputFocus);
}

function inputFocus(e) {
  if (e.ctrlKey && e.key === '/' ) {
    e.preventDefault();
    search.focus();
  }
  if (e.key === 'Escape' ) {
    search.blur();
    suggestions.classList.add('d-none');
  }
}

document.addEventListener('click', function(event) {

  var isClickInsideElement = suggestions.contains(event.target);

  if (!isClickInsideElement) {
    suggestions.classList.add('d-none');
  }

});

/*
Source:
  - https://dev.to/shubhamprakash/trap-focus-using-javascript-6a3
*/

document.addEventListener('keydown',suggestionFocus);

function suggestionFocus(e) {
  const suggestionsHidden = suggestions.classList.contains('d-none');
  if (suggestionsHidden) return;

  const focusableSuggestions= [...suggestions.querySelectorAll('a')];
  if (focusableSuggestions.length === 0) return;

  const index = focusableSuggestions.indexOf(document.activeElement);

  if (e.key === "ArrowUp") {
    e.preventDefault();
    const nextIndex = index > 0 ? index - 1 : 0;
    focusableSuggestions[nextIndex].focus();
  }
  else if (e.key === "ArrowDown") {
    e.preventDefault();
    const nextIndex= index + 1 < focusableSuggestions.length ? index + 1 : index;
    focusableSuggestions[nextIndex].focus();
  }

}

/*
Source:
  - https://github.com/nextapps-de/flexsearch#index-documents-field-search
  - https://raw.githack.com/nextapps-de/flexsearch/master/demo/autocomplete.html
*/

(function(){

  var index = new FlexSearch.Document({
    cache: 100,
    document: {
      id: 'id',
      store: [
        "href", "title", "description", "content"
      ],
      index: ["title", "description", "content"],
    },
    encode: false,
    tokenize: str => str.replace(/[\x00-\x7F]/g, "").split("")
  });

  var index_en = new FlexSearch.Document({
    language: "en",
    cache: 100,
    document: {
      id: 'id',
      store: [
        "href", "title", "description", "content", "tags", "contributors", "speakers"
      ],
      index: ["title", "description", "content", "tags", "contributors", "speakers"],
    },
    tokenize: "forward"
  })


  // Not yet supported: https://github.com/nextapps-de/flexsearch#complex-documents

  /*
  var docs = [
    {{ range $index, $page := (where .Site.Pages "Section" "docs") -}}
      {
        id: {{ $index }},
        href: "{{ .Permalink }}",
        title: {{ .Title | jsonify }},
        description: {{ .Params.description | jsonify }},
        content: {{ .Content | jsonify }}
      },
    {{ end -}}
  ];
  */

  // https://discourse.gohugo.io/t/range-length-or-last-element/3803/2

  {{ $list := slice }}
  {{- if and (isset .Site.Params.options "searchsectionsindex") (not (eq (len .Site.Params.options.searchSectionsIndex) 0)) }}
  {{- if eq .Site.Params.options.searchSectionsIndex "ALL" }}
  {{- $list = .Site.Pages }}
  {{- else }}
  {{- $list = (where .Site.Pages "Type" "in" .Site.Params.options.searchSectionsIndex) }}
  {{- if (in .Site.Params.options.searchSectionsIndex "HomePage") }}
  {{ $list = $list | append .Site.Home }}
  {{- end }}
  {{- end }}
  {{- else }}
  {{- $list = (where .Site.Pages "Section" "seminar") }}
  {{- end }}

  {{ $len := (len $list) -}}

  {{ range $index, $element := $list -}}
    index.add(
      {
        id: {{ $index }},
        href: "{{ .Permalink }}",
        title: {{ .Title | jsonify }},
        tags: {{ .Params.tags | jsonify }},
        contributors: {{ .Params.contributors | jsonify }},
        speakers: {{ .Params.speakers | jsonify }},
        {{ with .Description -}}
          description: {{ . | jsonify }},
        {{ else -}}
          description: {{ .Summary | plainify | jsonify }},
        {{ end -}}
        content: {{ .Plain | jsonify }}
      }
    );
    index_en.add(
      {
        id: {{ $index }},
        href: "{{ .Permalink }}",
        title: {{ .Title | jsonify }},
        tags: {{ .Params.tags | jsonify }},
        contributors: {{ .Params.contributors | jsonify }},
        speakers: {{ .Params.speakers | jsonify }},
        {{ with .Description -}}
          description: {{ . | jsonify }},
        {{ else -}}
          description: {{ .Summary | plainify | jsonify }},
        {{ end -}}
        content: {{ .Plain | jsonify }}
      }
    );
  {{ end -}}

  search.addEventListener('input', show_results, true);

  function show_results(){
    const maxResult = 100;
    var searchQuery = this.value;
    const results_en = index_en.search(
      searchQuery, {limit: maxResult, enrich: true})
    const results_o = index.search(searchQuery, {limit: maxResult, enrich: true});

    const results = results_en.concat(results_o);

    // flatten results since index.search() returns results for each indexed field
    const flatResults = new Map(); // keyed by href to dedupe results

    for (const result of results.flatMap(r => r.result)) {
      if (flatResults.has(result.doc.href)) continue;
      flatResults.set(result.doc.href, result.doc);
    }

    suggestions.innerHTML = "";
    suggestions.classList.remove('d-none');

    const regex = new RegExp(searchQuery.split(/\s+/).filter((i) => i?.length).join("|"), 'gi')
    const regex_scope = new RegExp(".{0,15}" + searchQuery.split(/\s+/).filter((i) => i?.length).join("|") + ".{0,15}\.", 'gi');

    // inform user that no results were found
    if (flatResults.size === 0 && searchQuery) {
      const noResultsMessage = document.createElement('div')
      noResultsMessage.innerHTML = `{{ i18n "no_result" }} "<strong>${searchQuery}</strong>"`
      noResultsMessage.classList.add("suggestion__no-results");
      suggestions.appendChild(noResultsMessage);
      return;
    }

    // construct a list of suggestions
    for (const [href, doc] of flatResults) {
        const entry = document.createElement('div');
        entry.classList.add("suggestion__result");
        suggestions.appendChild(entry);

        const a = document.createElement('a');
        a.href = href;
        entry.appendChild(a);

        const title = document.createElement('div');
        title.textContent = doc.title;
        title.classList.add("suggestion__title");
        a.appendChild(title);

        const description = document.createElement('div');

        var match = (doc.title + " - " + doc.description + " - " + doc.content)
          .replace(/<\/?[^>]+>/gi, ' ')
          .replace(/(\r\n|\n|\r)/gi, "")
          .match(regex_scope);
        try {
          match[0] = "..." + match[0];
          description.innerHTML = match.join(" ... ").slice(0, 100)
          .replace(regex, (match) => `<strong>${match}</strong>`);
        } catch (e) {
          description.textContent = doc.description;
        }

        description.classList.add("suggestion__description");
        a.appendChild(description);

        suggestions.appendChild(entry);

        if(suggestions.childElementCount == maxResult) break;
    }
  }
}());
