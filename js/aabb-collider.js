/* global AFRAME, THREE */

/**
* Axis-aligned bounding box collider
* Detects when entities intersect and emits 'hit' events
*/
AFRAME.registerComponent('aabb-collider', {
  schema: {
    objects: {default: '.grabbable'},
    interval: {default: 80}
  },

  init: function () {
    this.els = [];
    this.collisions = [];
    this.elMax = new THREE.Vector3();
    this.elMin = new THREE.Vector3();
  },

  play: function () {
    this.updateCollisionTargets();
  },

  pause: function () {
    this.els = [];
  },

  updateCollisionTargets: function () {
    var data = this.data;
    var objectEls;

    // Query for collision targets
    if (data.objects) {
      objectEls = this.el.sceneEl.querySelectorAll(data.objects);
    } else {
      // If no objects specified, try to get all entities.
      objectEls = this.el.sceneEl.children;
    }
    // Convert from NodeList to Array
    this.els = Array.prototype.slice.call(objectEls);
  },

  tick: (function () {
    var boundingBox = new THREE.Box3();
    return function () {
      var collisions = [];
      var el = this.el;
      var mesh = el.getObject3D('mesh');
      var self = this;
      // Update our bounding box
      if (mesh) {
        boundingBox.setFromObject(mesh);
      }
      // Update collisions
      this.els.forEach(intersect);
      // Emit events for newly detected collisions
      collisions.forEach(handleHit);
      // Keep track of current collisions
      this.collisions = collisions;

      // Bounding box collision detection
      function intersect (el) {
        var intersected;
        var mesh = el.getObject3D('mesh');
        var elAABB = new THREE.Box3();
        if (!mesh) { return; }
        elAABB.setFromObject(mesh);
        intersected = boundingBox.intersectsBox(elAABB);
        if (!intersected) { return; }
        collisions.push(el);
      }

      function handleHit (hitEl) {
        if (self.collisions.indexOf(hitEl) === -1) {
          el.emit('hit', {el: hitEl});
        }
      }
    };
  })()
});
