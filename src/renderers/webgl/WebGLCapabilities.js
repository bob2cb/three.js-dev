/**
 * @author mrdoob / http://mrdoob.com/
 */

function WebGLCapabilities( gl, extensions, parameters ) {

	var maxAnisotropy;

	function getMaxAnisotropy() {

		if ( maxAnisotropy !== undefined ) return maxAnisotropy;

		var extension = extensions.get( 'EXT_texture_filter_anisotropic' );

		if ( extension !== null ) {

			maxAnisotropy = gl.getParameter( extension.MAX_TEXTURE_MAX_ANISOTROPY_EXT );

		} else {

			maxAnisotropy = 0;

		}

		return maxAnisotropy;

	}

	function getMaxPrecision( precision ) {

		if ( precision === 'highp' ) {

			if ( gl.getShaderPrecisionFormat( gl.VERTEX_SHADER, gl.HIGH_FLOAT ).precision > 0 &&
			     gl.getShaderPrecisionFormat( gl.FRAGMENT_SHADER, gl.HIGH_FLOAT ).precision > 0 ) {

				return 'highp';

			}

			precision = 'mediump';

		}

		if ( precision === 'mediump' ) {

			if ( gl.getShaderPrecisionFormat( gl.VERTEX_SHADER, gl.MEDIUM_FLOAT ).precision > 0 &&
			     gl.getShaderPrecisionFormat( gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT ).precision > 0 ) {

				return 'mediump';

			}

		}

		return 'lowp';

	}

	var precision = parameters.precision !== undefined ? parameters.precision : 'highp';
	var maxPrecision = getMaxPrecision( precision );

	if ( maxPrecision !== precision ) {

		console.warn( 'THREE.WebGLRenderer:', precision, 'not supported, using', maxPrecision, 'instead.' );
		precision = maxPrecision;

	}
	//gl.getExtension('EXT_frag_depth');
	//Now the output variable gl_FragDepthEXT is available to set a depth value of a fragment from within the fragment shader:
	/*
	void main() {
  		gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0); 
  		gl_FragDepthEXT = 0.5; 
	}
	*/
	var logarithmicDepthBuffer = parameters.logarithmicDepthBuffer === true && !! extensions.get( 'EXT_frag_depth' );

	var maxTextures = gl.getParameter( gl.MAX_TEXTURE_IMAGE_UNITS );
	var maxVertexTextures = gl.getParameter( gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS );
	var maxTextureSize = gl.getParameter( gl.MAX_TEXTURE_SIZE );
	var maxCubemapSize = gl.getParameter( gl.MAX_CUBE_MAP_TEXTURE_SIZE );

	var maxAttributes = gl.getParameter( gl.MAX_VERTEX_ATTRIBS );
	var maxVertexUniforms = gl.getParameter( gl.MAX_VERTEX_UNIFORM_VECTORS );
	var maxVaryings = gl.getParameter( gl.MAX_VARYING_VECTORS );
	var maxFragmentUniforms = gl.getParameter( gl.MAX_FRAGMENT_UNIFORM_VECTORS );

	var vertexTextures = maxVertexTextures > 0;
	var floatFragmentTextures = !! extensions.get( 'OES_texture_float' );
	var floatVertexTextures = vertexTextures && floatFragmentTextures;

	return {

		getMaxAnisotropy: getMaxAnisotropy,
		getMaxPrecision: getMaxPrecision,

		//"highp"
		precision: precision,
		//false
		logarithmicDepthBuffer: logarithmicDepthBuffer,
		//16.在一个片段着色器上纹理单元的最大数量
		maxTextures: maxTextures,
		//16.在一个顶点着色器上纹理单元的最大数量
		maxVertexTextures: maxVertexTextures,
		//16384.纹理的最大尺寸
		maxTextureSize: maxTextureSize,
		//16384.cube纹理的最大尺寸
		maxCubemapSize: maxCubemapSize,
		
		//16.顶点属性的最大数量
		maxAttributes: maxAttributes,
		//4096 顶点Uniform变量的最大数量
		maxVertexUniforms: maxVertexUniforms,
		//16 可传递变量的最大数量
		maxVaryings: maxVaryings,
		//1024 片段Uniform变量的最大数量
		maxFragmentUniforms: maxFragmentUniforms,

		//true
		vertexTextures: vertexTextures,
		//true。
		//if is true。The type parameter now accepts gl.FLOAT.
		//if is true。The pixels parameter now accepts an ArrayBufferView of type Float32Array.
		floatFragmentTextures: floatFragmentTextures,
		//true
		floatVertexTextures: floatVertexTextures

	};

}


export { WebGLCapabilities };
