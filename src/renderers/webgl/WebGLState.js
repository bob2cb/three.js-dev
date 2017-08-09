/**
 * @author mrdoob / http://mrdoob.com/
 */

import { NotEqualDepth, GreaterDepth, GreaterEqualDepth, EqualDepth, LessEqualDepth, LessDepth, AlwaysDepth, NeverDepth, CullFaceFront, CullFaceBack, CullFaceNone, CustomBlending, MultiplyBlending, SubtractiveBlending, AdditiveBlending, NoBlending, NormalBlending, DoubleSide, BackSide } from '../../constants';
import { Vector4 } from '../../math/Vector4';

function WebGLState( gl, extensions, paramThreeToGL ) {

	function ColorBuffer() {
		//是否加锁
		var locked = false;
		//创建颜色值 
		var color = new Vector4();
		//当前能否写入颜色帧缓冲区
		var currentColorMask = null;
		//当前背景的渲染颜色
		var currentColorClear = new Vector4();

		return {
			//设置能否写入颜色帧缓冲区，参数colorMask为bool类型，为GL_TRUE时，程序允许对颜色帧缓冲区进行修改和写入
			setMask: function ( colorMask ) {
				//如果用户改变了颜色帧缓冲区的写入状态并且没有加锁
				if ( currentColorMask !== colorMask && ! locked ) {
					//重新设置颜色帧缓冲区的写入状态
					gl.colorMask( colorMask, colorMask, colorMask, colorMask );
					currentColorMask = colorMask;

				}

			},
			//设置是否加锁，如果lock为true，则表示一直已经加锁，颜色帧缓冲区的写入状态不能改变 
			setLocked: function ( lock ) {

				locked = lock;

			},

			//Premultiplied Alpha为true表示rgb值需乘alpha,最重要的意义是使得带透明度图片纹理可以正常的进行线性插值解释：
			//premultipliedAlpha的详细解释http://blog.csdn.net/mydreamremindme/article/details/50817294
			setClear: function ( r, g, b, a, premultipliedAlpha ) {

				if ( premultipliedAlpha === true ) {

					r *= a; g *= a; b *= a;

				}

				color.set( r, g, b, a );

				if ( currentColorClear.equals( color ) === false ) {

					gl.clearColor( r, g, b, a );
					currentColorClear.copy( color );

				}

			},

			reset: function () {

				locked = false;

				currentColorMask = null;
				currentColorClear.set( 0, 0, 0, 1 );

			}

		};

	}

	function DepthBuffer() {

		var locked = false;
		//表示是否可以对深度缓冲区进行修改 
		var currentDepthMask = null;
		var currentDepthFunc = null;
		var currentDepthClear = null;

		return {
			//设置是否开启深度检测 
			setTest: function ( depthTest ) {

				if ( depthTest ) {

					enable( gl.DEPTH_TEST );

				} else {

					disable( gl.DEPTH_TEST );

				}

			},
			//设置是否可以对深度缓冲区进行修改
			setMask: function ( depthMask ) {

				if ( currentDepthMask !== depthMask && ! locked ) {

					gl.depthMask( depthMask );
					currentDepthMask = depthMask;

				}

			},
			/** 关于gl.depthFunc()官方是这样解释的：            
			  * GL_NEVER, GL_LESS, GL_EQUAL, GL_LEQUAL, GL_GREATER, GL_NOTEQUAL, GL_GEQUAL, GL_ALWAYS are accepted. The initial value is GL_LESS.             
			  * 那么来翻译一下吧。此函数的作用是确定深度值的比较方式。
			  * 每画一个物体，设备中将存储每个像素点的深度值，
			  * 如果需要新绘制一个物体A，则对应像素处的深度值需要和深度缓冲区的值进行比较，
			  * 默认情况下，gl.depthFunc( GL_LESS)，也就是在对于某个像素处，
			  * A的深度值小于帧缓冲区中对应的深度值才会取A的颜色，否则不会发生改变。
			  */ 
			setFunc: function ( depthFunc ) {

				if ( currentDepthFunc !== depthFunc ) {

					if ( depthFunc ) {

						switch ( depthFunc ) {

							case NeverDepth:

								gl.depthFunc( gl.NEVER );
								break;

							case AlwaysDepth:

								gl.depthFunc( gl.ALWAYS );
								break;

							case LessDepth:
								//深度小的时候才渲染。
								gl.depthFunc( gl.LESS );
								break;
								//深度小或相等的时候也渲染。
							case LessEqualDepth:

								gl.depthFunc( gl.LEQUAL );
								break;

							case EqualDepth:

								gl.depthFunc( gl.EQUAL );
								break;

							case GreaterEqualDepth:

								gl.depthFunc( gl.GEQUAL );
								break;

							case GreaterDepth:

								gl.depthFunc( gl.GREATER );
								break;

							case NotEqualDepth:

								gl.depthFunc( gl.NOTEQUAL );
								break;

							default:

								gl.depthFunc( gl.LEQUAL );

						}

					} else {

						gl.depthFunc( gl.LEQUAL );

					}

					currentDepthFunc = depthFunc;

				}

			},

			setLocked: function ( lock ) {

				locked = lock;

			},
			//清除深度缓冲区，depth值为要设置的深度缓冲区的值，取值范围为【0-1】
			setClear: function ( depth ) {

				if ( currentDepthClear !== depth ) {

					gl.clearDepth( depth );
					currentDepthClear = depth;

				}

			},

			reset: function () {

				locked = false;

				currentDepthMask = null;
				currentDepthFunc = null;
				currentDepthClear = null;

			}

		};

	}
	/*关于模板测试，有一篇文章写的挺好的，分享给大家，http://blog.csdn.net/wangdingqiaoit/article/details/52143197*/ 
	//模板缓冲的相关设置，模板缓冲的值取值范围为[0-2的n次方-1]，其中n代表模板缓冲值在2进制下的位数，（一般为8位）  
	function StencilBuffer() {

		var locked = false;
		//设置模板缓冲是否可以写入   
		var currentStencilMask = null;
		//设置模板测试的比较方式
		var currentStencilFunc = null;
		var currentStencilRef = null;
		var currentStencilFuncMask = null;
		var currentStencilFail = null;
		var currentStencilZFail = null;
		var currentStencilZPass = null;
		var currentStencilClear = null;

		return {

			setTest: function ( stencilTest ) {

				if ( stencilTest ) {

					enable( gl.STENCIL_TEST );

				} else {

					disable( gl.STENCIL_TEST );

				}

			},
			//glStencilMask(0xFF);
			setMask: function ( stencilMask ) {

				if ( currentStencilMask !== stencilMask && ! locked ) {

					gl.stencilMask( stencilMask );
					currentStencilMask = stencilMask;

				}

			},

			setFunc: function ( stencilFunc, stencilRef, stencilMask ) {

				if ( currentStencilFunc !== stencilFunc ||
				     currentStencilRef 	!== stencilRef 	||
				     currentStencilFuncMask !== stencilMask ) {

					gl.stencilFunc( stencilFunc, stencilRef, stencilMask );

					currentStencilFunc = stencilFunc;
					currentStencilRef = stencilRef;
					currentStencilFuncMask = stencilMask;

				}

			},
			/*	stencilFail代表的是模板测试失败，对应模板缓冲区的值应该进行的操作，
				可选的值有GL_KEEP，GL_ZERO，GL_REPLACE，GL_INCR，GL_INCR_WRAP，GL_DECR，GL_DECR_WRAP，GL_INVERT          
				stencilZFail代表的是模板测试成功，但是深度检测没有通过后的操作，可选的值和上面的相同          
				stencilZPass代表的是模板测试和深度检测都通过时，或者模板测试通过同时深度测试关闭的情况。可选择的值和上面相同
			*/ 
			setOp: function ( stencilFail, stencilZFail, stencilZPass ) {

				if ( currentStencilFail	 !== stencilFail 	||
				     currentStencilZFail !== stencilZFail ||
				     currentStencilZPass !== stencilZPass ) {

					gl.stencilOp( stencilFail, stencilZFail, stencilZPass );

					currentStencilFail = stencilFail;
					currentStencilZFail = stencilZFail;
					currentStencilZPass = stencilZPass;

				}

			},

			setLocked: function ( lock ) {

				locked = lock;

			},

			setClear: function ( stencil ) {

				if ( currentStencilClear !== stencil ) {

					gl.clearStencil( stencil );
					currentStencilClear = stencil;

				}

			},

			reset: function () {

				locked = false;

				currentStencilMask = null;
				currentStencilFunc = null;
				currentStencilRef = null;
				currentStencilFuncMask = null;
				currentStencilFail = null;
				currentStencilZFail = null;
				currentStencilZPass = null;
				currentStencilClear = null;

			}

		};

	}

	//

	var colorBuffer = new ColorBuffer();
	var depthBuffer = new DepthBuffer();
	var stencilBuffer = new StencilBuffer();

	var maxVertexAttributes = gl.getParameter( gl.MAX_VERTEX_ATTRIBS );
	var newAttributes = new Uint8Array( maxVertexAttributes );
	var enabledAttributes = new Uint8Array( maxVertexAttributes );
	var attributeDivisors = new Uint8Array( maxVertexAttributes );

	var capabilities = {};

	var compressedTextureFormats = null;

	var currentProgram = null;

	var currentBlending = null;
	var currentBlendEquation = null;
	var currentBlendSrc = null;
	var currentBlendDst = null;
	var currentBlendEquationAlpha = null;
	var currentBlendSrcAlpha = null;
	var currentBlendDstAlpha = null;
	var currentPremultipledAlpha = false;

	var currentFlipSided = null;
	var currentCullFace = null;

	var currentLineWidth = null;

	var currentPolygonOffsetFactor = null;
	var currentPolygonOffsetUnits = null;

	var currentScissorTest = null;
	//单个片段着色器能访问的纹理单元数，最低16，一般16或32
	var maxTextures = gl.getParameter( gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS );
	//获取当前WebGL的版本
	var version = parseFloat( /^WebGL\ ([0-9])/.exec( gl.getParameter( gl.VERSION ) )[ 1 ] );
	var lineWidthAvailable = parseFloat( version ) >= 1.0;

	var currentTextureSlot = null;
	var currentBoundTextures = {};

	var currentScissor = new Vector4();
	var currentViewport = new Vector4();

	//type：GL_TEXTURE_2D or GL_TEXTURE_CUBE_MAP
	function createTexture( type, target, count ) {

		var data = new Uint8Array( 4 ); // 4 is required to match default unpack alignment of 4.
		var texture = gl.createTexture();

		gl.bindTexture( type, texture );
		//设置纹理缩小取样的方式为最近点采样
		gl.texParameteri( type, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
		//设置纹理扩大取样的方式为最近点采样 
		gl.texParameteri( type, gl.TEXTURE_MAG_FILTER, gl.NEAREST );

		for ( var i = 0; i < count; i ++ ) {

			gl.texImage2D( target + i, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data );

		}

		return texture;

	}

	var emptyTextures = {};
	//初始化2D纹理 
	emptyTextures[ gl.TEXTURE_2D ] = createTexture( gl.TEXTURE_2D, gl.TEXTURE_2D, 1 );
	//初始化立方体纹理
	emptyTextures[ gl.TEXTURE_CUBE_MAP ] = createTexture( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_CUBE_MAP_POSITIVE_X, 6 );

	// init

	colorBuffer.setClear( 0, 0, 0, 1 );
	depthBuffer.setClear( 1 );
	stencilBuffer.setClear( 0 );

	enable( gl.DEPTH_TEST );
	depthBuffer.setFunc( LessEqualDepth );
	//是否开启正反面转换，通常情况下，当观察者从正面看三角形时ti，三角形的构造方式是逆时针的。
	//这样程序会将所有顺时针构造的三角形面当作被遮挡的面进行剔除。从而很大程度上避免了无用的系统开销 
	setFlipSided( false );
	//设置背面剪裁的方式，一共有三种（1.只显示正面，2.只显示背面，3同时显示正面和背面） 
	setCullFace( CullFaceBack );
	enable( gl.CULL_FACE );

	enable( gl.BLEND );
	setBlending( NormalBlending );


	//初始化属性数组（WebGL中可支持的属性最多有8种包括 顶点坐标、颜色、纹理坐标、多重纹理坐标、顶点坐标索引等）
	function initAttributes() {

		for ( var i = 0, l = newAttributes.length; i < l; i ++ ) {

			newAttributes[ i ] = 0;

		}

	}

	function enableAttribute( attribute ) {

		//newAttributes[“属性名” ] = 1;表示应启用对应属性
		newAttributes[ attribute ] = 1;

		if ( enabledAttributes[ attribute ] === 0 ) {

			gl.enableVertexAttribArray( attribute );
			enabledAttributes[ attribute ] = 1;

		}
		//不明白？？？？？
		if ( attributeDivisors[ attribute ] !== 0 ) {

			var extension = extensions.get( 'ANGLE_instanced_arrays' );

			extension.vertexAttribDivisorANGLE( attribute, 0 );
			attributeDivisors[ attribute ] = 0;

		}

	}

	function enableAttributeAndDivisor( attribute, meshPerAttribute ) {

		newAttributes[ attribute ] = 1;

		if ( enabledAttributes[ attribute ] === 0 ) {

			gl.enableVertexAttribArray( attribute );
			enabledAttributes[ attribute ] = 1;

		}

		if ( attributeDivisors[ attribute ] !== meshPerAttribute ) {

			var extension = extensions.get( 'ANGLE_instanced_arrays' );

			extension.vertexAttribDivisorANGLE( attribute, meshPerAttribute );
			attributeDivisors[ attribute ] = meshPerAttribute;

		}

	}

	function disableUnusedAttributes() {

		for ( var i = 0, l = enabledAttributes.length; i !== l; ++ i ) {

			if ( enabledAttributes[ i ] !== newAttributes[ i ] ) {

				gl.disableVertexAttribArray( i );
				enabledAttributes[ i ] = 0;

			}

		}

	}

	function enable( id ) {

		if ( capabilities[ id ] !== true ) {

			gl.enable( id );
			capabilities[ id ] = true;

		}

	}

	function disable( id ) {

		if ( capabilities[ id ] !== false ) {

			gl.disable( id );
			capabilities[ id ] = false;

		}

	}
	//得到压缩纹理格式   
	function getCompressedTextureFormats() {

		if ( compressedTextureFormats === null ) {

			compressedTextureFormats = [];

			if ( extensions.get( 'WEBGL_compressed_texture_pvrtc' ) ||
			     extensions.get( 'WEBGL_compressed_texture_s3tc' ) ||
			     extensions.get( 'WEBGL_compressed_texture_etc1' ) ) {

				var formats = gl.getParameter( gl.COMPRESSED_TEXTURE_FORMATS );

				for ( var i = 0; i < formats.length; i ++ ) {

					compressedTextureFormats.push( formats[ i ] );

				}

			}

		}

		return compressedTextureFormats;

	}

	function useProgram( program ) {

		if ( currentProgram !== program ) {

			gl.useProgram( program );

			currentProgram = program;

			return true;

		}

		return false;

	}
	//设置颜色混合的多种方式和比例
	function setBlending( blending, blendEquation, blendSrc, blendDst, blendEquationAlpha, blendSrcAlpha, blendDstAlpha, premultipliedAlpha ) {

		if ( blending !== NoBlending ) {

			enable( gl.BLEND );

		} else {

			disable( gl.BLEND );

		}

		if ( ( blending !== CustomBlending ) && ( blending !== currentBlending || premultipliedAlpha !== currentPremultipledAlpha ) ) {

			if ( blending === AdditiveBlending ) {

				if ( premultipliedAlpha ) {

					gl.blendEquationSeparate( gl.FUNC_ADD, gl.FUNC_ADD );
					gl.blendFuncSeparate( gl.ONE, gl.ONE, gl.ONE, gl.ONE );

				} else {
					/*blendEquation方法用于将RGB混合方程和阿尔法混合方程设置为单个方程。
					gl.FUNC_ADD 源+目的地（默认值），
					gl.FUNC_SUBTRACT: 源 - 目的地，
					gl.FUNC_REVERSE_SUBTRACT: 目的地 - 源*/
					gl.blendEquation( gl.FUNC_ADD );
					gl.blendFunc( gl.SRC_ALPHA, gl.ONE );

				}

			} else if ( blending === SubtractiveBlending ) {

				if ( premultipliedAlpha ) {

					gl.blendEquationSeparate( gl.FUNC_ADD, gl.FUNC_ADD );
					gl.blendFuncSeparate( gl.ZERO, gl.ZERO, gl.ONE_MINUS_SRC_COLOR, gl.ONE_MINUS_SRC_ALPHA );

				} else {

					gl.blendEquation( gl.FUNC_ADD );
					gl.blendFunc( gl.ZERO, gl.ONE_MINUS_SRC_COLOR );

				}

			} else if ( blending === MultiplyBlending ) {

				if ( premultipliedAlpha ) {

					gl.blendEquationSeparate( gl.FUNC_ADD, gl.FUNC_ADD );
					gl.blendFuncSeparate( gl.ZERO, gl.SRC_COLOR, gl.ZERO, gl.SRC_ALPHA );

				} else {

					gl.blendEquation( gl.FUNC_ADD );
					gl.blendFunc( gl.ZERO, gl.SRC_COLOR );

				}

			} else {

				if ( premultipliedAlpha ) {

					gl.blendEquationSeparate( gl.FUNC_ADD, gl.FUNC_ADD );
					gl.blendFuncSeparate( gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA );

				} else {

					gl.blendEquationSeparate( gl.FUNC_ADD, gl.FUNC_ADD );
					gl.blendFuncSeparate( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA );

				}

			}

			currentBlending = blending;
			currentPremultipledAlpha = premultipliedAlpha;

		}

		if ( blending === CustomBlending ) {

			blendEquationAlpha = blendEquationAlpha || blendEquation;
			blendSrcAlpha = blendSrcAlpha || blendSrc;
			blendDstAlpha = blendDstAlpha || blendDst;

			if ( blendEquation !== currentBlendEquation || blendEquationAlpha !== currentBlendEquationAlpha ) {

				gl.blendEquationSeparate( paramThreeToGL( blendEquation ), paramThreeToGL( blendEquationAlpha ) );

				currentBlendEquation = blendEquation;
				currentBlendEquationAlpha = blendEquationAlpha;

			}

			if ( blendSrc !== currentBlendSrc || blendDst !== currentBlendDst || blendSrcAlpha !== currentBlendSrcAlpha || blendDstAlpha !== currentBlendDstAlpha ) {

				gl.blendFuncSeparate( paramThreeToGL( blendSrc ), paramThreeToGL( blendDst ), paramThreeToGL( blendSrcAlpha ), paramThreeToGL( blendDstAlpha ) );

				currentBlendSrc = blendSrc;
				currentBlendDst = blendDst;
				currentBlendSrcAlpha = blendSrcAlpha;
				currentBlendDstAlpha = blendDstAlpha;

			}

		} else {

			currentBlendEquation = null;
			currentBlendSrc = null;
			currentBlendDst = null;
			currentBlendEquationAlpha = null;
			currentBlendSrcAlpha = null;
			currentBlendDstAlpha = null;

		}

	}

	function setMaterial( material ) {

		material.side === DoubleSide
			? disable( gl.CULL_FACE )
			: enable( gl.CULL_FACE );

		setFlipSided( material.side === BackSide );

		material.transparent === true
			? setBlending( material.blending, material.blendEquation, material.blendSrc, material.blendDst, material.blendEquationAlpha, material.blendSrcAlpha, material.blendDstAlpha, material.premultipliedAlpha )
			: setBlending( NoBlending );

		depthBuffer.setFunc( material.depthFunc );
		depthBuffer.setTest( material.depthTest );
		depthBuffer.setMask( material.depthWrite );
		colorBuffer.setMask( material.colorWrite );

		setPolygonOffset( material.polygonOffset, material.polygonOffsetFactor, material.polygonOffsetUnits );

	}

	//flipSided默认为false,即绘制顺序为逆时针

	function setFlipSided( flipSided ) {

		if ( currentFlipSided !== flipSided ) {

			if ( flipSided ) {
				//绘制顺序为顺时针
				gl.frontFace( gl.CW );

			} else {
 				//绘制顺序为逆时针
				gl.frontFace( gl.CCW );

			}

			currentFlipSided = flipSided;

		}

	}
	//设置剔除
	function setCullFace( cullFace ) {

		if ( cullFace !== CullFaceNone ) {

			enable( gl.CULL_FACE );

			if ( cullFace !== currentCullFace ) {

				if ( cullFace === CullFaceBack ) {

					gl.cullFace( gl.BACK );

				} else if ( cullFace === CullFaceFront ) {

					gl.cullFace( gl.FRONT );

				} else {

					gl.cullFace( gl.FRONT_AND_BACK );

				}

			}

		} else {

			disable( gl.CULL_FACE );

		}

		currentCullFace = cullFace;

	}

	function setLineWidth( width ) {

		if ( width !== currentLineWidth ) {

			if ( lineWidthAvailable ) gl.lineWidth( width );

			currentLineWidth = width;

		}

	}
	//设置多边形偏移量，此方法可以有效解决Z-fight问题
	// 详情请看这里：http://www.cnblogs.com/bitzhuwei/archive/2015/06/12/4571539.html 
	function setPolygonOffset( polygonOffset, factor, units ) {

		if ( polygonOffset ) {

			enable( gl.POLYGON_OFFSET_FILL );

			if ( currentPolygonOffsetFactor !== factor || currentPolygonOffsetUnits !== units ) {

				gl.polygonOffset( factor, units );

				currentPolygonOffsetFactor = factor;
				currentPolygonOffsetUnits = units;

			}

		} else {

			disable( gl.POLYGON_OFFSET_FILL );

		}

	}

	function getScissorTest() {

		return currentScissorTest;

	}
	//启用或禁用剪裁测试: 
	function setScissorTest( scissorTest ) {

		currentScissorTest = scissorTest;

		if ( scissorTest ) {

			enable( gl.SCISSOR_TEST );

		} else {

			disable( gl.SCISSOR_TEST );

		}

	}

	// texture

	function activeTexture( webglSlot ) {

		if ( webglSlot === undefined ) webglSlot = gl.TEXTURE0 + maxTextures - 1;

		if ( currentTextureSlot !== webglSlot ) {

			gl.activeTexture( webglSlot );
			currentTextureSlot = webglSlot;

		}

	}

	function bindTexture( webglType, webglTexture ) {

		if ( currentTextureSlot === null ) {

			activeTexture();

		}

		var boundTexture = currentBoundTextures[ currentTextureSlot ];

		if ( boundTexture === undefined ) {

			boundTexture = { type: undefined, texture: undefined };
			currentBoundTextures[ currentTextureSlot ] = boundTexture;

		}

		if ( boundTexture.type !== webglType || boundTexture.texture !== webglTexture ) {

			gl.bindTexture( webglType, webglTexture || emptyTextures[ webglType ] );

			boundTexture.type = webglType;
			boundTexture.texture = webglTexture;

		}

	}

	function compressedTexImage2D() {

		try {

			gl.compressedTexImage2D.apply( gl, arguments );

		} catch ( error ) {

			console.error( 'THREE.WebGLState:', error );

		}

	}

	function texImage2D() {

		try {

			gl.texImage2D.apply( gl, arguments );

		} catch ( error ) {

			console.error( 'THREE.WebGLState:', error );

		}

	}

	//

	function scissor( scissor ) {

		if ( currentScissor.equals( scissor ) === false ) {

			gl.scissor( scissor.x, scissor.y, scissor.z, scissor.w );
			currentScissor.copy( scissor );

		}

	}

	function viewport( viewport ) {

		if ( currentViewport.equals( viewport ) === false ) {

			gl.viewport( viewport.x, viewport.y, viewport.z, viewport.w );
			currentViewport.copy( viewport );

		}

	}

	//

	function reset() {

		for ( var i = 0; i < enabledAttributes.length; i ++ ) {

			if ( enabledAttributes[ i ] === 1 ) {

				gl.disableVertexAttribArray( i );
				enabledAttributes[ i ] = 0;

			}

		}

		capabilities = {};

		compressedTextureFormats = null;

		currentTextureSlot = null;
		currentBoundTextures = {};

		currentProgram = null;

		currentBlending = null;

		currentFlipSided = null;
		currentCullFace = null;

		colorBuffer.reset();
		depthBuffer.reset();
		stencilBuffer.reset();

	}

	return {

		buffers: {
			color: colorBuffer,
			depth: depthBuffer,
			stencil: stencilBuffer
		},

		initAttributes: initAttributes,
		enableAttribute: enableAttribute,
		enableAttributeAndDivisor: enableAttributeAndDivisor,
		disableUnusedAttributes: disableUnusedAttributes,
		enable: enable,
		disable: disable,
		getCompressedTextureFormats: getCompressedTextureFormats,

		useProgram: useProgram,

		setBlending: setBlending,
		setMaterial: setMaterial,

		setFlipSided: setFlipSided,
		setCullFace: setCullFace,

		setLineWidth: setLineWidth,
		setPolygonOffset: setPolygonOffset,

		getScissorTest: getScissorTest,
		setScissorTest: setScissorTest,

		activeTexture: activeTexture,
		bindTexture: bindTexture,
		compressedTexImage2D: compressedTexImage2D,
		texImage2D: texImage2D,

		scissor: scissor,
		viewport: viewport,

		reset: reset

	};

}


export { WebGLState };
