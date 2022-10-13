var docs = [
{{ range $index, $page := (where .Site.Pages "Section" "seminar") -}}
  {
    id: {{ $index }},
    title: "{{ .Title }}",
    description: "{{ .Params.description }}",
    href: "{{ .URL | relURL }}",
    contributors: "{{ .Params.contributors }}",
    speakers: "{{ .Params.speakers }}"
  },
{{ end -}}
];
