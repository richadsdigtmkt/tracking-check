// Contenedor de prueba con la misma estructura que un gtm.js real
var data = {
"resource": {
  "version": "12",
  "macros": [{"function":"__e"},{"function":"__u","vtp_component":"PATH"},{"function":"__v","vtp_name":"gtm.triggers"}],
  "tags": [
    {"function":"__googtag","tag_id":1},
    {"function":"__awct","vtp_conversionId":"123456789","vtp_conversionLabel":"abcDEF","tag_id":2},
    {"function":"__gaawe","vtp_eventName":"generate_lead","tag_id":3},
    {"function":"__awct","vtp_conversionId":"123456789","vtp_conversionLabel":"xyz","tag_id":4},
    {"function":"__gaawe","vtp_eventName":"phone_click","tag_id":5},
    {"function":"__html","vtp_html":"<script>fbq('track', 'Lead');</script>","tag_id":6},
    {"function":"__gaawe","vtp_eventName":"page_view","tag_id":7},
    {"function":"__fsl","tag_id":8}
  ],
  "predicates": [
    {"function":"_eq","arg0":["macro",0],"arg1":"gtm.js"},
    {"function":"_eq","arg0":["macro",0],"arg1":"gtm.formSubmit"},
    {"function":"_cn","arg0":["macro",1],"arg1":"/danke"},
    {"function":"_eq","arg0":["macro",0],"arg1":"gtm.click"},
    {"function":"_eq","arg0":["macro",0],"arg1":"wpcf7mailsent"}
  ],
  "rules": [
    [["if",0],["add",0,7]],
    [["if",1],["add",2]],
    [["if",0,2],["add",1]],
    [["if",3],["add",3,4]],
    [["if",4],["add",5]]
  ]
},
"runtime": []
};
/* resto del código de GTM */ (function(){ var x = "}{"; })();
