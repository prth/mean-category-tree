module.exports = function generateJSON(){
    var categoryList = [];
    var itemList = [];
    var categoryCovered = [];

    generateJSON.prototype.initiateCategoryList = function(cat1) {
        categoryList = cat1;
    }

    generateJSON.prototype.getProcessedTree = function() {
        var finalTree = [];
        finalTree.push(categoryList);
        finalTree.push(itemList);
		return finalTree;
    }

    generateJSON.prototype.processTree = function(parentId, categoryLevel, itemList) {
        var childCategories = categoryList.filter(function (cat) {
            return cat.parentCategory == parentId
        });

        for (var c = 0; c < childCategories.length; c++) {
            childCategories[c].categoryNodeLevel = categoryLevel;
            //console.log(childCategories[c]);
            if (parentId == 0) {
                itemList.push({
                    _id: childCategories[c]._id,
                    categorySlug: childCategories[c].categorySlug,
                    name: childCategories[c].categoryName,
                    parentCategory: 0,
                    editCat: false,
                    expandNode: true,
                    isValid: true,
                    showAdd: false,
                    categoryNodeLevel: categoryLevel,
                    nodes: [{isValid: false, showAdd: false, parentCategory: childCategories[c]._id}]
                });
                //console.log('adding root ' + childCategories[c].categoryName)
            } else {
                var parent = getCategoryObject(itemList, childCategories[c].parentCategory);
                if (parent == null) {
                    itemList.push({
                        _id: childCategories[c]._id,
                        categorySlug: childCategories[c].categorySlug,
                        name: childCategories[c].categoryName,
                        parentCategory: 0,
                        editCat: false,
                        expandNode: true,
                        isValid: true,
                        showAdd: false,
                        categoryNodeLevel: categoryLevel,
                        nodes: [{isValid: false, showAdd: false, parentCategory: childCategories[c]._id}]
                    });
                    //console.log('adding parent not found ' + childCategories[c].categoryName)
                } else {
                    parent.nodes.push({
                        _id: childCategories[c]._id,
                        categorySlug: childCategories[c].categorySlug,
                        name: childCategories[c].categoryName,
                        parentCategory: childCategories[c].parentCategory,
                        expandNode: true,
                        editCat: false,
                        isValid: true,
                        showAdd: false,
                        categoryNodeLevel: categoryLevel,
                        nodes: [{isValid: false, showAdd: false, parentCategory: childCategories[c]._id}]
                    });
                    //console.log('adding parent found' + childCategories[c].categoryName)
                }
            }

            if (categoryCovered.indexOf(childCategories[c].categoryName) == -1) {
                categoryCovered.push(childCategories[c].categoryName);
                processTree(childCategories[c]._id, categoryLevel + 1, itemList);
            }

        }
    }
};
