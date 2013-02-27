
exports.Empty = table(
    "area,base,basefont,br,col,embed,frame,hr",
    "img,input,isindex,link,meta,param"
);

exports.Block = table(
    "address,applet,blockquote,button,center",
    "dd,del,dir,div,dl,dt,fieldset,form,frameset",
    "hr,iframe,ins,isindex,li,map,menu",
    "noframes,noscript,object,ol,p,pre,script",
    "table,tbody,td,tfoot,th,thead,tr,ul"
);

exports.Inline = table(
    "a,abbr,acronym,applet,b,basefont,bdo,big,br,button",
    "cite,code,del,dfn,em,font,i,iframe,img,input,ins,kbd",
    "label,map,object,q,s,samp,script,select,small,span",
    "strike,strong,sub,sup,textarea,tt,u,var"
);

exports.LazyClosing = table(
    "colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr"
);

exports.Special = table(
    "script,style"
);

exports.FlagAttributes = table(
    "checked,compact,declare,defer,disabled,ismap,multiple",
    "nohref,noresize,noshade,nowrap,readonly,selected"
);

// Generate lookup table from specified string. The string contains comma separated values.
function table() {
    var lookup = {},
        lines = Array.prototype.slice.call(arguments),
        items = lines.join(',').split(',');

    for (var i = 0; i < items.length; i++)
        lookup[items[i]] = true;

    return lookup;
}