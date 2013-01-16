define([ 'exports', 'underscore', 'widgy.backbone', 'nodes/nodes',
    'text!./shelf.html'
    ], function(exports, _, Backbone, nodes,
      shelf_view_template
      ) {

  var ShelfCollection = Backbone.Collection.extend({
    initialize: function(options) {
      this.model = nodes.Node;

      this.node = options.node;
    }

  });

  var ShelfView = Backbone.View.extend({
    className: 'shelf',
    template: shelf_view_template,

    initialize: function(options) {
      Backbone.View.prototype.initialize.apply(this, arguments);
      _.bindAll(this,
        'addOne',
        'addAll',
        'refresh',
        'addOptions',
        'filterDuplicates'
      );

      this.collection
        .on('reset', this.addAll)
        .on('add', this.addOne);

      this.app = options.app;

      this.list = new Backbone.ViewList();
    },

    addAll: function() {
      this.list.closeAll();
      this.collection.each(this.addOne);
    },

    addOne: function(model) {
      var view = new nodes.NodePreviewView({
        model: model,
        app: this.app
      });

      model.once('node:sync', this.app.refreshCompatibility);
      view.on('all', this.bubble);

      this.list.push(view);
      this.$list.append(view.render().el);
    },

    render: function() {
      Backbone.View.prototype.render.apply(this, arguments);
      this.$list = this.$el.children('.list');

      return this;
    },

    refresh: function() {
      this.app.refreshCompatibility();
    },

    addOptions: function(content_classes) {
      _.each(content_classes, function(content_class) {
        if ( this.collection.where({'__class__': content_class['__class__']}).length == 0 )
          this.collection.add(content_class);
      }, this);
    },

    filterDuplicates: function(parent_view) {
      var seen_classes = [];
      parent_view = parent_view.parent
      while ( parent_view )
      {
        if (parent_view.hasShelf())
        {
          _.each(parent_view.getShelf().collection.toJSON(), function(data) {
            this.collection.remove(this.collection.where({'__class__': data['__class__']}));
          }, this);
        }
        parent_view = parent_view.parent;
      }

    }
  });


  _.extend(exports, {
    ShelfCollection: ShelfCollection,
    ShelfView: ShelfView
  });
});
