this.renderBufferDirect = function ( camera, fog, geometry, material, object, group ) {
	var program = setProgram( camera, fog, material, object );
	setupVertexAttributes( material, program, geometry );
	renderer.render( drawStart, drawCount );
}
	function setProgram( camera, fog, material, object ) {
		_usedTextureUnits = 0;
		initMaterial( material, fog, object );
		WebGLUniforms.upload(_gl, materialProperties.uniformsList, m_uniforms, _this );
	}

		function initMaterial( material, fog, object ) {
			materialProperties.shader = {}
			program = programCache.acquireProgram
			var programAttributes = program.getAttributes();
			var progUniforms = materialProperties.program.getUniforms(),
		}

		WebGLUniforms.upload = function ( gl, seq, values, renderer ) {setValue}
			function setValueT1( gl, v, renderer ) {
				renderer.setTexture2D( v || emptyTexture, unit );
			}
			function setTexture2D( texture, slot ) {
			if ( texture.version > 0 && textureProperties.__version !== texture.version ) {
				uploadTexture( textureProperties, texture, slot );
			}
			state.activeTexture( _gl.TEXTURE0 + slot );
			state.bindTexture( _gl.TEXTURE_2D, textureProperties.__webglTexture );
		}

		function uploadTexture( textureProperties, texture, slot ) {
			if ( textureProperties.__webglInit === undefined ) {
				textureProperties.__webglInit = true;
				init....
			}
			state.activeTexture( _gl.TEXTURE0 + slot );
			state.bindTexture( _gl.TEXTURE_2D, textureProperties.__webglTexture );
			_gl.pixelStorei();
			_gl.texParameteri();
			state.texImage2D( _gl.TEXTURE_2D, i, glFormat, mipmap.width, mipmap.height, 0, glFormat, glType, mipmap.data );
			_gl.generateMipmap( _gl.TEXTURE_2D )
		}