App.View.CategoryView = Backbone.View.extend({
	tagName: "tr",
	model: App.Model.CategoriesModel, 
	initialize: function() {
		this.channelTr = _.template( $("#categoryTempTr").html());
		this.model.on('change',this.render,this);
	},
	events: {
		"click .actions .delet-cat": "deleteCategory"
	},
	render: function() {
		this.$el.html(this.channelTr({category: this.model.toJSON()}));
		this.$el.attr("id", this.model.get("category_id"));
		if(this.model.get("deleted")){
			this.$el.addClass("deleted hide");
			this.$el.find(".actions .delet-cat").html("Restore");
		} else {
			this.$el.addClass("active");
			this.$el.find(".actions .delet-cat").html("Delete");
		}
		//return this;
		return this;
	},
	deleteCategory: function(e) {
		var catTd = $(e.currentTarget);
		var catTr = catTd.closest("tr");
		var method = ""; 
		var isActionPerformed = false;
		var url = "";
		var modeId = this.model.get("category_id");
		var lastDate = this.model.get("last_update_time");
		var result = false;
		var operation = "";
		var deleteText  = "";
		//var that = this;
		if(catTd.html() == "Restore"){
			result = confirm("Are you sure you want to restore?");
			operation = "restore";
			method = "PUT";
			deleteText = "Delete";
		} else {
			result = confirm("Are you sure you want to delete?");
			operation = "delete";
			method = "DELETE";
			deleteText = "Restore";
		}
		if (result == true) {
			isActionPerformed = true;
			url = "http://54.186.130.217:8080/cataloger/manager/v1/categories/"+operation+"/"+modeId+"/"+lastDate;
			//catTr.removeClass("deleted hide").addClass("active");
			//catTd.text(deleteText);
			//this.render();
		}
		
		if(isActionPerformed){
			Backbone.ajax({
				type: method,
				url: url,
				success: function(){
					if(method == "DELETE"){
						that.model.set({"deleted": true});
					} else {
						that.model.set({"deleted": false});
					}
					alert("Success!");
				},
				error: function() {
					alert("Operation Failed!")
				} 
			});
		}
	}
	
});

App.ListView.CategoriesListView = Backbone.View.extend({
	el: ".wrapper",
	categoriesCollection: App.Collection.CategoriesCollection,
	initialize: function() {
		this.categoriesCollection.bind("reset", this.render, this); ;
		this.categoryTable = _.template( $("#categories-page-template").tablesorter().html());
		this.categoriesCollection = new App.Collection.CategoriesCollection();
		
	},
	events : {
		"click .show-deleted" : "toggleDeleted",
		"click .cat li.update": "showNewCategoryDialog",
		"click #categoryTable tr td.resrc-cat": "addUpdateResouces", 
		"click .resrc-delet-btn": "deleteResourceImage",
		"click .close_btn input": "closeResources",
		"click .create-cat-btn input": "openCategoryCreateDialog",
		"click .actions .edit-cat": "showCategoryEditDialog"
	},
	render: function() {
		var that = this;
		that.categoriesCollection.fetch({
			dataType: "jsonp",
			success: function(collection){
				that.$el.find(".table-wrapper").html(that.categoryTable());
				collection.each(function(catModel) {
					that.addCategoryItem(catModel);
					that.categoriesCollection.add(catModel);
				}, this);
				$("#categoryTable").tablesorter();
			},
			error: function (errorResponse) {
				console.log(errorResponse);
			}
		});
		return that;
	},
	toggleDeleted: function(e) {
			var deletedChkBx = $(e.currentTarget);
			if (deletedChkBx.hasClass("checked")) { 
				deletedChkBx.removeClass("checked");
				$("#categoryTable tr.deleted").addClass("hide");
			} else {
				deletedChkBx.addClass("checked");
				$("#categoryTable tr.deleted").removeClass("hide");
			}
	},
	addCategoryItem: function(model){
		var categoryItem = new App.View.CategoryView({model: model});
		this.$el.find(".table-wrapper tbody").append(categoryItem.el);
		categoryItem.render();
	},
	addUpdateResouces: function(e) {
		var thisView = this;
		var rowElem = $(e.currentTarget);
		var trElem = rowElem.closest("tr");
		var menuDiv = $(".cat-resources");
		$(".cat-resources", this.$el).css({"left": 319 + window.pageXOffset + "px", "top": 100 + window.pageYOffset + "px"});
		var id = trElem.attr("id");
		menuDiv.find("h1").html(trElem.find(".name").html() + " Resources");
		menuDiv.find(".resrc-browse-btn").addClass("cat");
		menuDiv.find(".resrc-browse-btn").removeClass("chan");
		menuDiv.find("li").css("display", "");
		menuDiv.find("li").attr("channelRowId", rowElem.attr("id"));
		if (rowElem.hasClass("deleted")) {
			menuDiv.find("li.deleted").css("display", "none");
		} else {
			menuDiv.find("li.restore").css("display", "none");
		}
		menuDiv.slideDown(function() {
			if(!$(".box_img1").hasClass("dz-clickable")){
				if(!$(".box_img1").hasClass("dz-clickable")){
					var imageType = $(this).attr("imageType");
					$.each($(".box_img1"),function(){
						var imageType = $(this).attr("imageType");
						var deviceType = $(this).attr("deviceType");
						$(this).dropzone({
							enctype: "image/png",
							url: "/cataloger/manager/v1/resources/"+imageType+"/category/"+id+"/"+deviceType,
							previewTemplate:'<div class="dz-preview dz-file-preview">\n  <div class="dz-details">\n    <div class="dz-filename"><span data-dz-name></span></div>\n        <img data-dz-thumbnail />\n  </div>\n  <div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div>\n  <div class="dz-success-mark"><span>?</span></div>\n  <div class="dz-error-mark"><span>?</span></div>\n  <div class="dz-error-message"><span data-dz-errormessage></span></div>\n</div>'
						});
						var that = this;
						$(that).next().find(".resrc-browse-btn").click(function (){
							$(that).click();
						});
					})
				}
			}
			$(document).on('keyup', thisView.closeResourcesOnKey);
		});		
	},
	deleteResourceImage: function(e) {
		var elem = $(e.currentTarget).closest(".img_box");
		var imgElem = elem.find(".box_img1");
		imgElem.find("div").remove();
	}, 
	closeResources: function(e){
		$(document).unbind("keyup", this.closeResourcesOnKey);
		$(".cat-resources").slideUp();
	},
	closeResourcesOnKey: function(e) {
		if (e.keyCode == 27) {
			$(".cat-resources .close_btn input").click();
		}
	},
	openCategoryEditDialog: function(catModel){
		var categoryForm = new App.Form.Categories()
		categoryForm.render(catModel.toJSON());
		$(categoryForm.$el).css({"left": 270 + window.pageXOffset + "px", "top": 175 + window.pageYOffset + "px"});
	},
	openCategoryCreateDialog: function(e){
		var catModel = new App.Model.CategoriesModel();
		this.openCategoryEditDialog(catModel);
	},
	showCategoryEditDialog: function(e) {
		var catTr = $(e.currentTarget).closest("tr");
		var modelId = parseInt(catTr.attr("id"));
		var catModel = this.categoriesCollection.findWhere({"category_id": modelId});
		this.openCategoryEditDialog(catModel);
	} 
});
