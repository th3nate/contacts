/**
Address editable input.
Internally value stored as {listName: "Moscow", listColor: "Lenina", building: "15"}

@class list
@extends abstractinput
@final
@example
<a href="#" id="list" data-type="list" data-pk="1">awesome</a>
<script>
$(function(){
    $('#list').editable({
        url: '/post',
        title: 'Enter city, street and building #',
        value: {
            listName: "Moscow", 
            listColor: "Lenina"
        }
    });
});
</script>
**/
(function ($) {
    "use strict";
    
    var List = function (options) {
        this.init('list', options, List.defaults);
    };

    //inherit from Abstract input
    $.fn.editableutils.inherit(List, $.fn.editabletypes.abstractinput);

    $.extend(List.prototype, {
        /**
        Renders input from tpl

        @method render() 
        **/        
        render: function() {
           this.$input = this.$tpl.find('input');
        },
        
        /**
        Default method to show value in element. Can be overwritten by display option.
        
        @method value2html(value, element) 
        **/
        value2html: function(value, element) {
            if(!value) {
                $(element).empty();
                return; 
            }
            var html = $('<div>').text(value.listName).html() + ', ' + $('<div>').text(value.listColor).html() + ' st., bld. ' + $('<div>').text(value.building).html();
            $(element).html(html); 
        },
        
        /**
        Gets value from element's html
        
        @method html2value(html) 
        **/        
        html2value: function(html) {        
          /*
            you may write parsing method to get value by element's html
            e.g. "Moscow, st. Lenina, bld. 15" => {listName: "Moscow", listColor: "Lenina", building: "15"}
            but for complex structures it's not recommended.
            Better set value directly via javascript, e.g. 
            editable({
                value: {
                    listName: "Moscow", 
                    listColor: "Lenina"
                }
            });
          */ 
          return null;  
        },
      
       /**
        Converts value to string. 
        It is used in internal comparing (not for sending to server).
        
        @method value2str(value)  
       **/
       value2str: function(value) {
           var str = '';
           if(value) {
               for(var k in value) {
                   str = str + k + ':' + value[k] + ';';  
               }
           }
           return str;
       }, 
       
       /*
        Converts string to value. Used for reading value from 'data-value' attribute.
        
        @method str2value(str)  
       */
       str2value: function(str) {
           /*
           this is mainly for parsing value defined in data-value attribute. 
           If you will always set value by javascript, no need to overwrite it
           */
           return str;
       },                
       
       /**
        Sets value of input.
        
        @method value2input(value) 
        @param {mixed} value
       **/         
       value2input: function(value) {
           if(!value) {
             return;
           }
           this.$input.filter('[name="listName"]').val(value.listName);
           this.$input.filter('[name="listColor"]').val(value.listColor);
       },       
       
       /**
        Returns value of input.
        
        @method input2value() 
       **/          
       input2value: function() { 
           return {
              listName: this.$input.filter('[name="listName"]').val(), 
              listColor: this.$input.filter('[name="listColor"]').val()
           };
       },        
       
        /**
        Activates input: sets focus on the first field.
        
        @method activate() 
       **/        
       activate: function() {
            this.$input.filter('[name="listName"]').focus();
       },  
       
       /**
        Attaches handler to submit form in case of 'showbuttons=false' mode
        
        @method autosubmit() 
       **/       
       autosubmit: function() {
           this.$input.keydown(function (e) {
                if (e.which === 13) {
                    $(this).closest('form').submit();
                }
           });
       }       
    });

    List.defaults = $.extend({}, $.fn.editabletypes.abstractinput.defaults, {
        tpl: '<div class="editable-list"><label><span>Name: </span><input type="text" name="listName" class="input-small"></label></div>'+
             '<div class="editable-list"><label><span>Color: </span><input type="text" name="listColor" data-toggle="colorpicker" class="input-small"></label></div>',
             
        inputclass: ''
    });

    $.fn.editabletypes.list = List;

}(window.jQuery));