/**
 *  Various functions to map a TIFF file from the source reader.
 *
 *  @author rkwright, August 2017
 *
 */



/**
 * Constructor for the TIFFMapper "class"
 *
 * @param scene
 * @param reader
 * @constructor
 */
TIFFX.TIFFMapper = function ( scene, reader ) {

    this.scene  = scene;
    this.reader = reader;
    this.globeGeom = undefined;
    this.globeMat = undefined;
    this.globeMesh = undefined;

    this.createGlobe();
};


TIFFX.TIFFMapper.prototype = {

    createGlobe: function () {
        console.log("TIFFMapper:createMesh");

        this.globeGeom = new THREE.Geometry();

        var vertices = this.createVertices();

        this.createFaces( vertices );

        this.createMaterial();

        this.globeMesh = new THREE.Mesh( this.globeGeom, this.globeMat );

        this.scene.add( sphere );
    },

    createVertices: function() {

        var image = this.reader.image;
        var height = image.getHeight();
        var width = image.getWidth();
        var deltaLat = 180.0 / (height-1) * Math.PI / 180.0;
        var deltaLon = 360.0 / (width-1) * Math.PI / 180.0;
        var x,y,z;
        var rasterData;
        var SCALE_FACTOR = 2;
        var vertArray = this.create2DArray(height);

        var lat = 90 * Math.PI / 180.0;
        for (var i = 0; i < height; i++) {
            var rasterWindow = [0, i, width - 1, i + 1];    // left, top, right, bottom
            rasterData = image.readRasters({window: rasterWindow});

            vertArray[i] = [];

            var lon = 0;
            for ( var j=0; j< rasterData[0].length; j++ ) {

                y = Math.sin(-lat) * SCALE_FACTOR;
                z = Math.cos(lat) * Math.sin(-lon) * SCALE_FACTOR;
                x = Math.cos(lat) * Math.cos(-lon) * SCALE_FACTOR;

                vertArray[i][j] = new THREE.Vector3(x,y,z);

                lon += deltaLon;
            }

            lat -= deltaLat;
        }

        return vertArray;
    },

    createFaces: function ( vertices ) {
        var face;

        for (var i = 0; i < vertices.length - 1; i++ ) {

            for (var j = 0; j < vertices[i].length - 1; j++) {
                var v0 = vertices[i][j];
                var v1 = vertices[i][j+1];
                var v2 = vertices[i+1][j+1];
                var v3 = vertices[i+1][j];

                this.globeGeom.faces.push(new THREE.Face3(v0, v1, v2));
                this.globeGeom.faces.push(new THREE.Face3(v0, v2, v3));
            }
        }

        this.globeGeom.computeFaceNormals();
        this.globeGeom.computeVertexNormals();

    },

    createMaterial: function () {
        this.globeMat = new THREE.MeshBasicMaterial( {color: 0xffff00, wireframe:true} );
    },

    computeQuadFaces: function ( i, j, offV, indexF ) {

        var vC = this.plane.vertices.length;
        var face;

        for ( var n=0; n<4; n++ )
            this.plane.vertices.push(this.terrain[i + offV[n].i][j + offV[n].j]);

        face = new THREE.Face3(vC + indexF[0].a, vC + indexF[0].b, vC + indexF[0].c);
        var ia = i + offV[indexF[0].a].i;
        var ja = j + offV[indexF[0].a].j;
        face.vertexColors[0] = this.getSurfColor(ia,ja);
        var ib = i + offV[indexF[0].b].i;
        var jb = j + offV[indexF[0].b].j;
        face.vertexColors[1] = this.getSurfColor(ib, jb);
        var ic = i + offV[indexF[0].c].i;
        var jc = j + offV[indexF[0].c].j;
        face.vertexColors[2] = this.getSurfColor(ic, jc);
        this.plane.faces.push(face);

        face = new THREE.Face3(vC + indexF[1].a, vC + indexF[1].b, vC + indexF[1].c);
        ia = i + offV[indexF[1].a].i;
        ja = j + offV[indexF[1].a].j;
        face.vertexColors[0] = this.getSurfColor(ia, ja);
        ib = i + offV[indexF[1].b].i;
        jb = j + offV[indexF[1].b].j;
        face.vertexColors[1] = this.getSurfColor(ib, jb);
        ic = i + offV[indexF[1].c].i;
        jc = j + offV[indexF[1].c].j;
        face.vertexColors[2] = this.getSurfColor(ic, jc);
        this.plane.faces.push(face);
    },

    create2DArray: function (rows) {
        var arr = [];

        for (var i=0;i<rows;i++) {
            arr[i] = [];
        }

        return arr;
    }
};