import { Color } from '../math/Color';
import { Vector3 } from '../math/Vector3';

/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */
 ///Face3对象的构造函数.用来在三维空间内通过参数a,b,c, normal, color, materialIndex创建一个三角面对象.Face3对象的功能函数采用定义构造的函数原型对象来实现

//用法1: 创建一个a,b,c三点组成的颜色0xffaa00,法线指向normal,材质索引为0的三角面对象. 
//var a=0,b=1,c=2; var normal = new THREE.Vector3( 0, 1, 0 ); 
//var color = new THREE.Color( 0xffaa00 ); var face = new THREE.Face3( a, b, c, normal, color, 0 ); 

//用法2: 创建一个颜色为0xffaa00,0x00aaff,0x00ffaa的a,b,c三点组成的,法线指向normal,材质索引为0的三角面对象. 
//var a=0,b=1,c=2; 
//var normal1 = new THREE.Vector3( 0, 1, 0 ), normal2 = new THREE.Vector3( 0, 1, 0 ), normal3 = new THREE.Vector3( 0, 1, 0 ); 
//normal = new Array(normal1,normal2,normal3); 
//var color1 = new THREE.Color( 0xffaa00 ), color2 = new THREE.Color( 0x00aaff ), color3 = new THREE.Color( 0x00ffaa ); 
//var color = new Array(color1,color2,color3); 
//var face = new THREE.Face3( a, b, c, normal, color, 0 ); 
function Face3( a, b, c, normal, color, materialIndex ) {

	this.a = a;
	this.b = b;
	this.c = c;

	this.normal = ( normal && normal.isVector3 ) ? normal : new Vector3();
	this.vertexNormals = Array.isArray( normal ) ? normal : [];

	this.color = ( color && color.isColor ) ? color : new Color();
	this.vertexColors = Array.isArray( color ) ? color : [];

	this.materialIndex = materialIndex !== undefined ? materialIndex : 0;

}

Object.assign( Face3.prototype, {

	clone: function () {

		return new this.constructor().copy( this );

	},

	copy: function ( source ) {

		this.a = source.a;
		this.b = source.b;
		this.c = source.c;

		this.normal.copy( source.normal );
		this.color.copy( source.color );

		this.materialIndex = source.materialIndex;

		for ( var i = 0, il = source.vertexNormals.length; i < il; i ++ ) {

			this.vertexNormals[ i ] = source.vertexNormals[ i ].clone();

		}

		for ( var i = 0, il = source.vertexColors.length; i < il; i ++ ) {

			this.vertexColors[ i ] = source.vertexColors[ i ].clone();

		}

		return this;

	}

} );


export { Face3 };
