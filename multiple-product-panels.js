/**
 * multipleProductsPanels [c]2016, @n_cholas, OmCore Ltd. MIT/GPL
 *
 * https://github.com/nicholaswright/multiple-product-panels
 */
;(function($) { 
    'use strict';
    $.fn.multipleProductsPanels = function(options) {
        return this.each(function() {
            
            var defaults = {
                    //onComplete: function() {},
                    
                    // Targets each section of products
                    sectionSelector: '[data-section]',
                    
                    // This class is assigned to all sections other than the first, for presenting
                    // a disabled state. When the user selects a product and the next section is 
                    // target this class is removed.
                    sectionDisabledClass: 'multi-products-section-disabled',
                    
                    // Used to find the product panels within each section
                    productPanelSelector: '[data-multi-product-variations-menus]',
                    
                    // The final button activated once a product from each section has been chosen
                    buttonSelector: '[data-button]'
                },
                settings = $.extend({}, defaults, options),
                container = $(this),
                
                // Stores the data of each product that is selected from each section.
            	selectedData = [],
            	
            	// Set elements
            	sections = container.find(settings.sectionSelector),
                addToBasketButton = container.find(settings.buttonSelector);
            
            addToBasketButton
                .on('click', function() {
                    
               		$('body').css('cursor', 'wait');
                    
                    // Scroll to the top as soon as the user clicks the add to basket button.
                    $('body,html').animate({
                        scrollTop: 0
                    }, 'slow');
                    
                	var postData = {};
                	$.each(selectedData, function(key, obj) {
                        postData['table_name_' + key] = 'm_products_products';
                        postData['id_' + key] = obj.id;
                        postData['title_' + key] = obj.title;
                        postData['gross_' + key] = obj.gross;
                        postData['image_src_' + key] = obj.imageSrc;
                        postData['variation_id_' + key] = obj.variationId;
                        postData['sku_' + key] = obj.sku;
                    });
                	$.post('/admin/controller/OrdersController/addOrderItem', postData, function(obj) {
                        // Once the items have been added to the basket reload the basket summary
                        // and once complete show the summary panel.
                        $('.basket-summary ').reloadContent({
                        	onComplete: function() {
                                $('body').css('cursor', 'inherit');
                                $('.basket-summary-panel').fadeIn();
                            }
                        });
                    });
                });
            
            sections.each(function(key) {
                var section = $(this),
                    panels = section.find(settings.productPanelSelector);
                    
                panels.each(function() {
                    var panel = $(this),
                        submitButton = panel.find('[data-variations-menus-button]');
                    
                    var productData,
                        variationData;
                    
                    // Activate each panel using the $.productVariationsMenus plugin and set
                    // it's onVariationData callback to update the productData array.
                    panel.productVariationsMenus({
                        onVariationData: function() {
                            productData = {
                                id: this.product.id,
                                title: this.product.title,
                                gross: this.product.sellingPrice,
                                imageSrc: this.product.photo, // This will set it as an ID but PHP will convert it.
                            	variationId: this.variation.id,
                                sku: this.variation.sku
                            }
                            
                            // Execute the default functionality which updates the UI.
                            return true;
                        }
                    });
                    
                    submitButton
                        .on('click', function(e) {
                            e.preventDefault();
                        	
                            selectedData[key] = productData;
                            
                            var nextSection = sections.eq(key+1);
                            if (nextSection.length) {
                                nextSection.find(settings.productPanelSelector).each(function() {
                                    // Remove the disabled attribute from the first  
                                    // select menu of each product panel.
                                    $(this)
                                        .find('select[disabled]')
                                            .eq(0)
                                                .removeAttr('disabled');
                                });
                                
                                // Slide down to the next section.
                                $('html, body').animate({
                                    scrollTop: nextSection.offset().top - 50 // -50 pixels so that the element isn't squashed against the top.
                                }, 1000);
                                
                                // Remove the disabled state of the next section. 
                                // The timeout is set to lose its disabled state just before 
                                // the animation above finishes. 
                                setTimeout(function() {
                                    // Remove the class when the animation ends so that the 
                                    // opacity transition is visible, as it's hard to see
                                    // when the scrolling is happening.
                                    nextSection.removeClass(settings.sectionDisabledClass)
                                }, 500); 
                                
                            // If this was the last section then a product from each section has been chosen.
                            // Remove the final button's disabled state and scroll down to it.
                            } else {
                                addToBasketButton.removeClass('disabled');
                                
                                $('html, body').animate({
                                    scrollTop: addToBasketButton.offset().top - 50 // -50 pixels so that the element isn't squashed against the top.
                                }, 1000);
                            }
                        });
                });
            });

        });
    };
})(jQuery);