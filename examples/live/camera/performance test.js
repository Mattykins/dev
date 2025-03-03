(() => {
  // ../phaser-genesis/src/config/const.ts
  var CONFIG_DEFAULTS = {
    AUTO: "Auto",
    BACKGROUND_COLOR: "BackgroundColor",
    BANNER: "Banner",
    BATCH_SIZE: "BatchSize",
    CANVAS_CONTEXT: "CanvasContext",
    CANVAS: "Canvas",
    DEFAULT_ORIGIN: "DefaultOrigin",
    GLOBAL_VAR: "GlobalVar",
    MAX_TEXTURES: "MaxTextures",
    PARENT: "Parent",
    RENDERER: "Renderer",
    SCENES: "Scenes",
    SIZE: "Size",
    WEBGL_CONTEXT: "WebGLContext",
    WEBGL: "WebGL",
    WORLD_SIZE: "WorldSize",
    WORLD_WIDTH: "WorldWidth",
    WORLD_HEIGHT: "WorldHeight"
  };

  // ../phaser-genesis/src/config/ConfigStore.ts
  var ConfigStore = new Map();

  // ../phaser-genesis/src/config/backgroundcolor/SetBackgroundColor.ts
  function SetBackgroundColor(color) {
    ConfigStore.set(CONFIG_DEFAULTS.BACKGROUND_COLOR, color);
  }

  // ../phaser-genesis/src/config/backgroundcolor/BackgroundColor.ts
  function BackgroundColor(color) {
    return () => {
      SetBackgroundColor(color);
    };
  }

  // ../phaser-genesis/src/config/banner/SetBanner.ts
  function SetBanner(title = "", version = "", url = "", color = "#fff", background = "linear-gradient(#3e0081 40%, #00bcc3)") {
    ConfigStore.set(CONFIG_DEFAULTS.BANNER, { title, version, url, color, background });
  }

  // ../phaser-genesis/src/config/batchsize/SetBatchSize.ts
  function SetBatchSize(size) {
    ConfigStore.set(CONFIG_DEFAULTS.BATCH_SIZE, size);
  }

  // ../phaser-genesis/src/config/batchsize/BatchSize.ts
  function BatchSize(size) {
    return () => {
      SetBatchSize(size);
    };
  }

  // ../phaser-genesis/src/renderer/BindingQueue.ts
  var queue = [];
  var BindingQueue = {
    add: (texture, glConfig) => {
      queue.push({ texture, glConfig });
    },
    get: () => {
      return queue;
    },
    clear: () => {
      queue.length = 0;
    }
  };

  // ../phaser-genesis/src/config/backgroundcolor/GetBackgroundColor.ts
  function GetBackgroundColor() {
    return ConfigStore.get(CONFIG_DEFAULTS.BACKGROUND_COLOR);
  }

  // ../phaser-genesis/src/config/size/GetHeight.ts
  function GetHeight() {
    return ConfigStore.get(CONFIG_DEFAULTS.SIZE).height;
  }

  // ../phaser-genesis/src/config/size/GetResolution.ts
  function GetResolution() {
    return ConfigStore.get(CONFIG_DEFAULTS.SIZE).resolution;
  }

  // ../phaser-genesis/src/config/size/GetWidth.ts
  function GetWidth() {
    return ConfigStore.get(CONFIG_DEFAULTS.SIZE).width;
  }

  // ../phaser-genesis/src/config/renderer/SetRenderer.ts
  function SetRenderer(renderer) {
    ConfigStore.set(CONFIG_DEFAULTS.RENDERER, renderer);
  }

  // ../phaser-genesis/src/config/defaultorigin/SetDefaultOrigin.ts
  function SetDefaultOrigin(x = 0.5, y = x) {
    ConfigStore.set(CONFIG_DEFAULTS.DEFAULT_ORIGIN, { x, y });
  }

  // ../phaser-genesis/src/config/globalvar/SetGlobalVar.ts
  function SetGlobalVar(name) {
    ConfigStore.set(CONFIG_DEFAULTS.GLOBAL_VAR, name);
  }

  // ../phaser-genesis/src/config/globalvar/GlobalVar.ts
  function GlobalVar(name) {
    return () => {
      SetGlobalVar(name);
    };
  }

  // ../phaser-genesis/src/config/maxtextures/SetMaxTextures.ts
  function SetMaxTextures(max) {
    ConfigStore.set(CONFIG_DEFAULTS.MAX_TEXTURES, max);
  }

  // ../phaser-genesis/src/dom/GetElement.ts
  function GetElement(target) {
    let element;
    if (target) {
      if (typeof target === "string") {
        element = document.getElementById(target);
      } else if (typeof target === "object" && target.nodeType === 1) {
        element = target;
      }
    }
    if (!element) {
      element = document.body;
    }
    return element;
  }

  // ../phaser-genesis/src/config/parent/SetParent.ts
  function SetParent(parentElement) {
    if (parentElement) {
      ConfigStore.set(CONFIG_DEFAULTS.PARENT, GetElement(parentElement));
    }
  }

  // ../phaser-genesis/src/config/parent/Parent.ts
  function Parent(parentElement) {
    return () => {
      SetParent(parentElement);
    };
  }

  // ../phaser-genesis/src/config/scenes/SetScenes.ts
  function SetScenes(scenes) {
    ConfigStore.set(CONFIG_DEFAULTS.SCENES, [].concat(scenes));
  }

  // ../phaser-genesis/src/config/scenes/Scenes.ts
  function Scenes(scenes) {
    return () => {
      SetScenes(scenes);
    };
  }

  // ../phaser-genesis/src/config/size/SetSize.ts
  function SetSize(width = 800, height = 600, resolution = 1) {
    if (resolution === 0) {
      resolution = window.devicePixelRatio;
    }
    ConfigStore.set(CONFIG_DEFAULTS.SIZE, { width, height, resolution });
  }

  // ../phaser-genesis/src/renderer/webgl1/GL.ts
  var gl;
  var GL = {
    get: () => {
      return gl;
    },
    set: (context) => {
      gl = context;
    }
  };

  // ../phaser-genesis/src/renderer/webgl1/renderpass/Draw.ts
  function Draw(renderPass) {
    const count = renderPass.count;
    if (count === 0) {
      return;
    }
    const currentBuffer = renderPass.vertexbuffer.current;
    const currentShader = renderPass.shader.current;
    const renderToFramebuffer = currentShader.shader.renderToFramebuffer;
    if (renderToFramebuffer) {
      renderPass.framebuffer.set(currentShader.shader.framebuffer, true);
    }
    if (count === currentBuffer.batchSize) {
      const type = currentBuffer.isDynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW;
      gl.bufferData(gl.ARRAY_BUFFER, currentBuffer.data, type);
    } else {
      const subsize = count * currentBuffer.entryElementSize;
      const view = currentBuffer.vertexViewF32.subarray(0, subsize);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, view);
    }
    if (currentBuffer.indexed) {
      gl.drawElements(gl.TRIANGLES, count * currentBuffer.entryIndexSize, gl.UNSIGNED_SHORT, 0);
    } else {
      gl.drawArrays(gl.TRIANGLES, 0, count * currentBuffer.elementsPerEntry);
    }
    if (renderToFramebuffer) {
      renderPass.framebuffer.pop();
    }
  }

  // ../phaser-genesis/src/renderer/webgl1/renderpass/Flush.ts
  function Flush(renderPass, forceCount) {
    if (forceCount) {
      renderPass.count = forceCount;
    }
    const count = renderPass.count;
    if (count === 0) {
      return false;
    }
    Draw(renderPass);
    renderPass.flush();
    return true;
  }

  // ../phaser-genesis/src/renderer/webgl1/renderpass/End.ts
  function End(renderPass) {
    Flush(renderPass);
  }

  // ../phaser-genesis/src/renderer/webgl1/textures/GetCompressedTextures.ts
  function GetCompressedTextures(gl2) {
    const extString = "WEBGL_compressed_texture_";
    const wkExtString = "WEBKIT_" + extString;
    const hasExt = (format) => {
      const results = gl2.getExtension(extString + format) || gl2.getExtension(wkExtString + format);
      if (results) {
        const glEnums = {};
        for (const key in results) {
          glEnums[results[key]] = key;
        }
        return glEnums;
      }
    };
    return {
      ETC: hasExt("etc"),
      ETC1: hasExt("etc1"),
      ATC: hasExt("atc"),
      ASTC: hasExt("astc"),
      BPTC: hasExt("bptc"),
      RGTC: hasExt("rgtc"),
      PVRTC: hasExt("pvrtc"),
      S3TC: hasExt("s3tc"),
      S3TCSRGB: hasExt("s3tc_srgb"),
      IMG: true
    };
  }

  // ../phaser-genesis/src/renderer/webgl1/colors/GetRGBArray.ts
  function GetRGBArray(color, output = []) {
    const r = color >> 16 & 255;
    const g = color >> 8 & 255;
    const b = color & 255;
    const a = color > 16777215 ? color >>> 24 : 255;
    output[0] = r / 255;
    output[1] = g / 255;
    output[2] = b / 255;
    output[3] = a / 255;
    return output;
  }

  // ../phaser-genesis/src/config/webglcontext/GetWebGLContext.ts
  function GetWebGLContext() {
    return ConfigStore.get(CONFIG_DEFAULTS.WEBGL_CONTEXT);
  }

  // ../phaser-genesis/src/renderer/webgl1/fbo/CreateFramebuffer.ts
  function CreateFramebuffer(texture, attachment) {
    if (!attachment) {
      attachment = gl.COLOR_ATTACHMENT0;
    }
    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, attachment, gl.TEXTURE_2D, texture, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return framebuffer;
  }

  // ../phaser-genesis/src/renderer/webgl1/textures/CreateGLTexture.ts
  function CreateGLTexture(binding, mipmaps) {
    const { generateMipmap, minFilter, parent, compressed, internalFormat, flipY, unpackPremultiplyAlpha, magFilter, wrapS, wrapT, isPOT } = binding;
    const source = parent.image;
    let width = parent.width;
    let height = parent.height;
    const glTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, glTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipY);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, unpackPremultiplyAlpha);
    if (source) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
      width = source.width;
      height = source.height;
    } else if (compressed && mipmaps) {
      for (let i = 0; i < mipmaps.length; i++) {
        gl.compressedTexImage2D(gl.TEXTURE_2D, i, internalFormat, mipmaps[i].width, mipmaps[i].height, 0, mipmaps[i].data);
      }
    } else {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    }
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);
    if (generateMipmap && isPOT) {
      gl.generateMipmap(gl.TEXTURE_2D);
    }
    binding.texture = glTexture;
    return glTexture;
  }

  // ../phaser-genesis/src/renderer/webgl1/fbo/DeleteFramebuffer.ts
  function DeleteFramebuffer(framebuffer) {
    if (gl && gl.isFramebuffer(framebuffer)) {
      gl.deleteFramebuffer(framebuffer);
    }
  }

  // ../phaser-genesis/src/renderer/webgl1/textures/DeleteGLTexture.ts
  function DeleteGLTexture(texture) {
    if (gl.isTexture(texture)) {
      gl.deleteTexture(texture);
    }
  }

  // ../phaser-genesis/src/math/pow2/IsSizePowerOfTwo.ts
  function IsSizePowerOfTwo(width, height) {
    if (width < 1 || height < 1) {
      return false;
    }
    return (width & width - 1) === 0 && (height & height - 1) === 0;
  }

  // ../phaser-genesis/src/renderer/webgl1/textures/SetGLTextureFilterMode.ts
  function SetGLTextureFilterMode(texture, linear = true) {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    const mode = linear ? gl.LINEAR : gl.NEAREST;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mode);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, mode);
  }

  // ../phaser-genesis/src/renderer/webgl1/textures/UpdateGLTexture.ts
  function UpdateGLTexture(binding) {
    const source = binding.parent.image;
    const width = source.width;
    const height = source.height;
    if (width > 0 && height > 0) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, binding.texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, binding.flipY);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    }
    return binding.texture;
  }

  // ../phaser-genesis/src/renderer/webgl1/textures/GLTextureBinding.ts
  var GLTextureBinding = class {
    parent;
    texture;
    framebuffer;
    depthbuffer;
    format;
    internalFormat;
    compressed;
    mipmaps;
    isBound = false;
    textureUnit = 0;
    unpackPremultiplyAlpha = true;
    minFilter;
    magFilter;
    wrapS;
    wrapT;
    flipY = false;
    isPOT = false;
    generateMipmap = false;
    constructor(parent, config = {}) {
      this.parent = parent;
      this.isPOT = IsSizePowerOfTwo(parent.width, parent.height);
      const {
        mipmaps = null,
        compressed = false,
        format = "IMG",
        internalFormat = 0,
        texture = null,
        framebuffer = null,
        createFramebuffer = false,
        depthbuffer = null,
        unpackPremultiplyAlpha = true,
        minFilter = this.isPOT ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR,
        magFilter = gl.LINEAR,
        wrapS = gl.CLAMP_TO_EDGE,
        wrapT = gl.CLAMP_TO_EDGE,
        generateMipmap = this.isPOT,
        flipY = false
      } = config;
      this.compressed = compressed;
      this.format = format;
      this.internalFormat = internalFormat;
      this.mipmaps = mipmaps;
      if (compressed) {
        this.minFilter = gl.LINEAR;
      } else {
        this.minFilter = minFilter;
      }
      this.magFilter = magFilter;
      this.wrapS = wrapS;
      this.wrapT = wrapT;
      this.generateMipmap = generateMipmap;
      this.flipY = flipY;
      this.unpackPremultiplyAlpha = unpackPremultiplyAlpha;
      if (texture) {
        this.texture = texture;
      } else {
        CreateGLTexture(this, mipmaps);
      }
      if (framebuffer) {
        this.framebuffer = framebuffer;
      } else if (createFramebuffer) {
        this.framebuffer = CreateFramebuffer(this.texture);
      }
      if (depthbuffer) {
        this.depthbuffer = depthbuffer;
      }
      parent.binding = this;
    }
    setFilter(linear) {
      if (this.texture) {
        SetGLTextureFilterMode(this.texture, linear);
      }
    }
    create() {
      const texture = this.texture;
      if (texture) {
        DeleteGLTexture(texture);
      }
      return CreateGLTexture(this);
    }
    update() {
      const texture = this.texture;
      if (!texture) {
        return CreateGLTexture(this);
      } else {
        return UpdateGLTexture(this);
      }
    }
    bind(index) {
      this.isBound = true;
      this.textureUnit = index;
    }
    unbind() {
      this.isBound = false;
      this.textureUnit = 0;
    }
    destroy() {
      this.unbind();
      DeleteGLTexture(this.texture);
      DeleteFramebuffer(this.framebuffer);
      this.parent = null;
      this.texture = null;
      this.framebuffer = null;
    }
  };

  // ../phaser-genesis/src/renderer/webgl1/renderpass/ProcessBindingQueue.ts
  function ProcessBindingQueue() {
    const queue2 = BindingQueue.get();
    queue2.forEach((entry) => {
      const { texture, glConfig } = entry;
      if (!texture.binding) {
        texture.binding = new GLTextureBinding(texture, glConfig);
      }
    });
    BindingQueue.clear();
  }

  // ../phaser-genesis/src/colormatrix/const.ts
  var DEFAULT_COLOR_MATRIX = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  var DEFAULT_COLOR_OFFSET = new Float32Array(4);

  // ../phaser-genesis/src/renderer/webgl1/renderpass/BlendModeStack.ts
  var BlendModeStack = class {
    renderPass;
    stack;
    default;
    index;
    constructor(renderPass) {
      this.renderPass = renderPass;
      this.stack = [];
    }
    get current() {
      return this.stack[this.index];
    }
    add(enable, sfactor, dfactor) {
      const entry = { enable, sfactor, dfactor };
      this.index++;
      if (this.index === this.stack.length) {
        this.stack.push(entry);
      } else {
        this.stack[this.index] = entry;
      }
      return entry;
    }
    bindDefault() {
      this.index = 0;
      this.bind(this.default);
    }
    bind(entry) {
      if (!entry) {
        entry = this.current;
      }
      if (entry.enable) {
        if (!gl.isEnabled(gl.BLEND) || (this.current.sfactor !== entry.sfactor || this.current.dfactor !== entry.dfactor)) {
          gl.enable(gl.BLEND);
          gl.blendFunc(entry.sfactor, entry.dfactor);
        }
      } else {
        gl.disable(gl.BLEND);
      }
    }
    pop() {
      this.index--;
      this.bind();
    }
    set(enable, sfactor, dfactor) {
      const entry = this.add(enable, sfactor, dfactor);
      this.bind(entry);
    }
    setDefault(enable, sfactor, dfactor) {
      const entry = { enable, sfactor, dfactor };
      this.stack[0] = entry;
      this.index = 0;
      this.default = entry;
    }
  };

  // ../phaser-genesis/src/components/color/CompareColorMatrix.ts
  function CompareColorMatrix(srcMatrix, srcOffset, targetMatrix, targetOffset) {
    for (let i = 0; i < srcOffset.length; i++) {
      if (srcOffset[i] !== targetOffset[i]) {
        return false;
      }
    }
    for (let i = 0; i < srcMatrix.length; i++) {
      if (srcMatrix[i] !== targetMatrix[i]) {
        return false;
      }
    }
    return true;
  }

  // ../phaser-genesis/src/renderer/webgl1/renderpass/ColorMatrixStack.ts
  var ColorMatrixStack = class {
    renderPass;
    stack;
    default;
    index;
    constructor(renderPass) {
      this.renderPass = renderPass;
      this.stack = [];
    }
    get current() {
      return this.stack[this.index];
    }
    add(colorMatrix, colorOffset) {
      const entry = { colorMatrix, colorOffset };
      this.index++;
      if (this.index === this.stack.length) {
        this.stack.push(entry);
      } else {
        this.stack[this.index] = entry;
      }
      return entry;
    }
    bindDefault() {
      this.index = 0;
      this.bind(this.default);
    }
    bind(entry) {
      if (!entry) {
        entry = this.current;
      }
      const shader = this.renderPass.getCurrentShader();
      Flush(this.renderPass);
      shader.setUniform("uColorMatrix", entry.colorMatrix);
      shader.setUniform("uColorOffset", entry.colorOffset);
    }
    pop() {
      this.index--;
      this.bind();
    }
    set(color) {
      const current = this.current;
      const entry = this.add(color.colorMatrix, color.colorOffset);
      if (!CompareColorMatrix(entry.colorMatrix, entry.colorOffset, current.colorMatrix, current.colorOffset)) {
        this.bind(entry);
      }
    }
    setDefault(colorMatrix, colorOffset) {
      const entry = { colorMatrix, colorOffset };
      this.stack[0] = entry;
      this.index = 0;
      this.default = entry;
    }
  };

  // ../phaser-genesis/src/renderer/webgl1/renderpass/FramebufferStack.ts
  var FramebufferStack = class {
    renderPass;
    stack;
    active;
    default;
    index;
    constructor(renderPass) {
      this.renderPass = renderPass;
      this.stack = [];
    }
    get current() {
      return this.stack[this.index];
    }
    add(framebuffer, viewport) {
      const entry = { framebuffer, viewport };
      this.index++;
      if (this.index === this.stack.length) {
        this.stack.push(entry);
      } else {
        this.stack[this.index] = entry;
      }
      return entry;
    }
    bindDefault() {
      this.index = 0;
      this.bind(false, this.default);
    }
    bind(clear = true, entry) {
      if (!entry) {
        entry = this.current;
      }
      const { framebuffer, viewport } = entry;
      if (this.active !== framebuffer) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      }
      if (clear) {
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      }
      if (viewport) {
        this.renderPass.viewport.set(viewport.x, viewport.y, viewport.width, viewport.height);
      }
      this.active = framebuffer;
    }
    pop() {
      if (this.current.viewport) {
        this.renderPass.viewport.pop();
      }
      this.index--;
      this.bind(false);
    }
    set(framebuffer, clear = true, viewport) {
      const entry = this.add(framebuffer, viewport);
      this.bind(clear, entry);
    }
    setDefault(framebuffer = null, viewport) {
      const entry = { framebuffer, viewport };
      this.stack[0] = entry;
      this.index = 0;
      this.default = entry;
    }
  };

  // ../phaser-genesis/src/config/batchsize/GetBatchSize.ts
  function GetBatchSize() {
    return ConfigStore.get(CONFIG_DEFAULTS.BATCH_SIZE);
  }

  // ../phaser-genesis/src/config/maxtextures/GetMaxTextures.ts
  function GetMaxTextures() {
    return ConfigStore.get(CONFIG_DEFAULTS.MAX_TEXTURES);
  }

  // ../phaser-genesis/src/math/mat4/Mat4Ortho.ts
  function Mat4Ortho(matrix, left, right, bottom, top, near, far) {
    const lr = 1 / (left - right);
    const bt = 1 / (bottom - top);
    const nf = 1 / (near - far);
    matrix.set([
      -2 * lr,
      0,
      0,
      0,
      0,
      -2 * bt,
      0,
      0,
      0,
      0,
      2 * nf,
      0,
      (left + right) * lr,
      (top + bottom) * bt,
      (far + near) * nf,
      1
    ]);
  }

  // ../phaser-genesis/src/renderer/webgl1/glsl/MULTI_QUAD_FRAG.ts
  var MULTI_QUAD_FRAG = `#define SHADER_NAME MULTI_QUAD_FRAG
#define numTextures %count%

precision highp float;

varying vec2 vTextureCoord;
varying float vTextureId;
varying vec4 vTintColor;

uniform sampler2D uTexture[%count%];
uniform mat4 uColorMatrix;
uniform vec4 uColorOffset;

vec4 getSampler (int index, vec2 uv)
{
    for (int i = 0; i < numTextures; ++i)
    {
        vec4 color = texture2D(uTexture[i], uv);

        if (i == index)
        {
            return color * vec4(vTintColor.rgb * vTintColor.a, vTintColor.a);
        }
    }

    //  Return black
    return vec4(0);
}

void main (void)
{
    vec4 color = getSampler(int(vTextureId), vTextureCoord);

    //  Un pre-mult alpha
    if (color.a > 0.0)
    {
        color.rgb /= color.a;
    }

    vec4 result = color * uColorMatrix + (uColorOffset / 255.0);

    //  Pre-mult alpha
    result.rgb *= result.a;

    gl_FragColor = vec4(result.rgb, result.a);
}`;

  // ../phaser-genesis/src/renderer/webgl1/shaders/DefaultQuadAttributes.ts
  var DefaultQuadAttributes = {
    aVertexPosition: { size: 2 },
    aTextureCoord: { size: 2 },
    aTextureId: { size: 1 },
    aTintColor: { size: 4 }
  };

  // ../phaser-genesis/src/renderer/webgl1/GL_CONST.ts
  var BYTE = 5120;
  var UNSIGNED_BYTE = 5121;
  var SHORT = 5122;
  var UNSIGNED_SHORT = 5123;
  var FLOAT = 5126;

  // ../phaser-genesis/src/renderer/webgl1/shaders/CreateAttributes.ts
  function CreateAttributes(program, attribs) {
    const attributes = new Map();
    const defaultSettings = {
      size: 1,
      type: FLOAT,
      normalized: false,
      stride: 0
    };
    let offset = 0;
    for (const [name, entry] of Object.entries(attribs)) {
      const index = gl.getAttribLocation(program, name);
      if (index !== -1) {
        gl.enableVertexAttribArray(index);
        const {
          size = defaultSettings.size,
          type = defaultSettings.type,
          normalized = defaultSettings.normalized,
          stride = defaultSettings.stride
        } = entry;
        attributes.set(name, { index, size, type, normalized, stride, offset });
        let typeSize = 4;
        if (type === UNSIGNED_SHORT || type === SHORT) {
          typeSize = 2;
        } else if (type === UNSIGNED_BYTE || type === BYTE) {
          typeSize = 1;
        }
        offset += size * typeSize;
      }
    }
    return attributes;
  }

  // ../phaser-genesis/src/renderer/webgl1/fbo/CreateDepthBuffer.ts
  function CreateDepthBuffer(framebuffer, textureWidth, textureHeight) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    const depthBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, textureWidth, textureHeight);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return depthBuffer;
  }

  // ../phaser-genesis/src/renderer/webgl1/shaders/DeleteShaders.ts
  function DeleteShaders(...shaders) {
    shaders.forEach((shader) => {
      gl.deleteShader(shader);
    });
  }

  // ../phaser-genesis/src/renderer/webgl1/shaders/CreateProgram.ts
  function CreateProgram(...shaders) {
    const program = gl.createProgram();
    shaders.forEach((shader) => {
      gl.attachShader(program, shader);
    });
    gl.linkProgram(program);
    const status = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!status) {
      const info = gl.getProgramInfoLog(program);
      console.error(`Error linking program: ${info}`);
      gl.deleteProgram(program);
      DeleteShaders(...shaders);
      return null;
    }
    return program;
  }

  // ../phaser-genesis/src/renderer/webgl1/shaders/CreateShader.ts
  function CreateShader(source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const status = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!status) {
      const info = gl.getShaderInfoLog(shader);
      const sourceLines = source.split("\n").map((line, index) => {
        return `${index}: ${line}`;
      });
      console.error(`Error compiling shader: ${info}`, sourceLines.join("\n"));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  // ../phaser-genesis/src/renderer/webgl1/shaders/CreateUniformSetter.ts
  function CreateUniformSetter(uniform, location, isArray = false) {
    switch (uniform.type) {
      case gl.INT:
      case gl.BOOL: {
        if (isArray) {
          return (v) => {
            gl.uniform1iv(location, v);
          };
        } else {
          return (v) => {
            gl.uniform1i(location, v);
          };
        }
      }
      case gl.INT_VEC2:
      case gl.BOOL_VEC2: {
        return (v) => {
          gl.uniform2iv(location, v);
        };
      }
      case gl.INT_VEC3:
      case gl.BOOL_VEC3: {
        return (v) => {
          gl.uniform3iv(location, v);
        };
      }
      case gl.INT_VEC4:
      case gl.BOOL_VEC4: {
        return (v) => {
          gl.uniform4iv(location, v);
        };
      }
      case gl.FLOAT: {
        if (isArray) {
          return (v) => {
            gl.uniform1fv(location, v);
          };
        } else {
          return (v) => {
            gl.uniform1f(location, v);
          };
        }
      }
      case gl.FLOAT_VEC2: {
        return (v) => {
          gl.uniform2fv(location, v);
        };
      }
      case gl.FLOAT_VEC3: {
        return (v) => {
          gl.uniform3fv(location, v);
        };
      }
      case gl.FLOAT_VEC4: {
        return (v) => {
          gl.uniform4fv(location, v);
        };
      }
      case gl.FLOAT_MAT2: {
        return (v) => {
          gl.uniformMatrix2fv(location, false, v);
        };
      }
      case gl.FLOAT_MAT3: {
        return (v) => {
          gl.uniformMatrix3fv(location, false, v);
        };
      }
      case gl.FLOAT_MAT4: {
        return (v) => {
          gl.uniformMatrix4fv(location, false, v);
        };
      }
      case gl.SAMPLER_2D:
      case gl.SAMPLER_CUBE: {
        if (uniform.size > 1) {
          return (v) => {
            gl.uniform1iv(location, v);
          };
        } else {
          return (v) => {
            gl.uniform1i(location, v);
          };
        }
      }
    }
  }

  // ../phaser-genesis/src/renderer/webgl1/shaders/CreateUniforms.ts
  function CreateUniforms(program) {
    const uniforms = new Map();
    const total2 = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < total2; i++) {
      const uniform = gl.getActiveUniform(program, i);
      let name = uniform.name;
      if (name.startsWith("gl_") || name.startsWith("webgl_")) {
        continue;
      }
      const location = gl.getUniformLocation(program, name);
      if (location) {
        let isArray = false;
        if (name.endsWith("[0]")) {
          name = name.slice(0, -3);
          isArray = uniform.size > 1;
        }
        uniforms.set(name, CreateUniformSetter(uniform, location, isArray));
      }
    }
    return uniforms;
  }

  // ../phaser-genesis/src/renderer/webgl1/shaders/DefaultQuadUniforms.ts
  var DefaultQuadUniforms = {
    uProjectionMatrix: new Float32Array(16),
    uCameraMatrix: new Float32Array(16),
    uTexture: 0,
    uColorMatrix: new Float32Array([
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1
    ]),
    uColorOffset: new Float32Array(4)
  };

  // ../phaser-genesis/src/renderer/webgl1/glsl/SINGLE_QUAD_FRAG.ts
  var SINGLE_QUAD_FRAG = `#define SHADER_NAME SINGLE_QUAD_FRAG

precision highp float;

varying vec2 vTextureCoord;
varying float vTextureId;
varying vec4 vTintColor;

uniform sampler2D uTexture;
uniform mat4 uColorMatrix;
uniform vec4 uColorOffset;

void main (void)
{
    vec4 color = texture2D(uTexture, vTextureCoord);

    //  Un pre-mult alpha
    if (color.a > 0.0)
    {
        color.rgb /= color.a;
    }

    vec4 result = color * uColorMatrix + (uColorOffset / 255.0);

    //  Pre-mult alpha
    result.rgb *= result.a;

    gl_FragColor = vec4(result.rgb, result.a);
}`;

  // ../phaser-genesis/src/renderer/webgl1/glsl/SINGLE_QUAD_VERT.ts
  var SINGLE_QUAD_VERT = `#define SHADER_NAME SINGLE_QUAD_VERT

precision highp float;

attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
attribute float aTextureId;
attribute vec4 aTintColor;

uniform mat4 uProjectionMatrix;
uniform mat4 uCameraMatrix;

varying vec2 vTextureCoord;
varying float vTextureId;
varying vec4 vTintColor;

void main (void)
{
    vTextureCoord = aTextureCoord;
    vTextureId = aTextureId;
    vTintColor = aTintColor;

    gl_Position = uProjectionMatrix * uCameraMatrix * vec4(aVertexPosition, 0.0, 1.0);
}`;

  // ../phaser-genesis/src/textures/UpdateFrameUVs.ts
  function UpdateFrameUVs(frame2) {
    const { x, y, width, height } = frame2;
    const baseTextureWidth = frame2.texture.width;
    const baseTextureHeight = frame2.texture.height;
    frame2.u0 = x / baseTextureWidth;
    frame2.v0 = y / baseTextureHeight;
    frame2.u1 = (x + width) / baseTextureWidth;
    frame2.v1 = (y + height) / baseTextureHeight;
    return frame2;
  }

  // ../phaser-genesis/src/textures/Frame.ts
  var Frame = class {
    texture;
    key;
    x;
    y;
    width;
    height;
    trimmed = false;
    sourceSizeWidth;
    sourceSizeHeight;
    spriteSourceSizeX;
    spriteSourceSizeY;
    spriteSourceSizeWidth;
    spriteSourceSizeHeight;
    pivot;
    u0;
    v0;
    u1;
    v1;
    constructor(texture, key, x, y, width, height) {
      this.texture = texture;
      this.key = key;
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.sourceSizeWidth = width;
      this.sourceSizeHeight = height;
      UpdateFrameUVs(this);
    }
    destroy() {
      this.texture = null;
    }
  };

  // ../phaser-genesis/src/textures/SetFrameSize.ts
  function SetFrameSize(frame2, width, height) {
    frame2.width = width;
    frame2.height = height;
    frame2.sourceSizeWidth = width;
    frame2.sourceSizeHeight = height;
    return UpdateFrameUVs(frame2);
  }

  // ../phaser-genesis/src/textures/Texture.ts
  var Texture = class {
    key = "";
    locked = true;
    width;
    height;
    image;
    binding;
    firstFrame;
    frames;
    data;
    constructor(image, width, height, glConfig) {
      if (image) {
        width = image.width;
        height = image.height;
      }
      this.image = image;
      this.width = width;
      this.height = height;
      this.frames = new Map();
      this.data = {};
      this.addFrame("__BASE", 0, 0, width, height);
      BindingQueue.add(this, glConfig);
    }
    addFrame(key, x, y, width, height) {
      if (this.frames.has(key)) {
        return null;
      }
      const frame2 = new Frame(this, key, x, y, width, height);
      this.frames.set(key, frame2);
      if (!this.firstFrame || this.firstFrame.key === "__BASE") {
        this.firstFrame = frame2;
      }
      return frame2;
    }
    getFrame(key) {
      if (!key) {
        return this.firstFrame;
      }
      if (key instanceof Frame) {
        key = key.key;
      }
      let frame2 = this.frames.get(key);
      if (!frame2) {
        console.warn(`Frame missing: ${key}`);
        frame2 = this.firstFrame;
      }
      return frame2;
    }
    setSize(width, height) {
      this.width = width;
      this.height = height;
      const frame2 = this.frames.get("__BASE");
      SetFrameSize(frame2, width, height);
    }
    update(image, glConfig) {
      this.image = image;
      this.setSize(image.width, image.height);
      BindingQueue.add(this, glConfig);
    }
    destroy() {
      if (this.binding) {
        this.binding.destroy();
      }
      this.frames.clear();
      this.binding = null;
      this.data = null;
      this.image = null;
      this.firstFrame = null;
    }
  };

  // ../phaser-genesis/src/renderer/webgl1/shaders/Shader.ts
  var Shader = class {
    program;
    attributes;
    uniforms;
    uniformSetters;
    texture;
    framebuffer;
    renderToFramebuffer = false;
    renderToDepthbuffer = false;
    isActive = false;
    constructor(config) {
      if (config) {
        this.fromConfig(config);
      }
    }
    fromConfig(config) {
      const {
        attributes = DefaultQuadAttributes,
        fragmentShader = SINGLE_QUAD_FRAG,
        height = GetHeight(),
        renderToFramebuffer = false,
        renderToDepthbuffer = false,
        resolution = GetResolution(),
        vertexShader = SINGLE_QUAD_VERT,
        width = GetWidth(),
        uniforms = DefaultQuadUniforms
      } = config;
      this.create(fragmentShader, vertexShader, uniforms, attributes);
      if (renderToFramebuffer) {
        this.renderToFramebuffer = true;
        const texture = new Texture(null, width * resolution, height * resolution);
        const binding = new GLTextureBinding(texture);
        binding.framebuffer = CreateFramebuffer(binding.texture);
        if (renderToDepthbuffer) {
          this.renderToDepthbuffer = true;
          binding.depthbuffer = CreateDepthBuffer(binding.framebuffer, texture.width, texture.height);
        }
        this.texture = texture;
        this.framebuffer = binding.framebuffer;
      }
    }
    create(fragmentShaderSource, vertexShaderSource, uniforms, attribs) {
      const fragmentShader = CreateShader(fragmentShaderSource, gl.FRAGMENT_SHADER);
      const vertexShader = CreateShader(vertexShaderSource, gl.VERTEX_SHADER);
      if (!fragmentShader || !vertexShader) {
        return;
      }
      const program = CreateProgram(fragmentShader, vertexShader);
      if (!program) {
        return;
      }
      const currentProgram = gl.getParameter(gl.CURRENT_PROGRAM);
      gl.useProgram(program);
      this.program = program;
      this.uniformSetters = CreateUniforms(program);
      this.uniforms = new Map();
      for (const [key, value] of Object.entries(uniforms)) {
        if (this.uniformSetters.has(key)) {
          this.uniforms.set(key, value);
        }
      }
      this.attributes = CreateAttributes(program, attribs);
      gl.useProgram(currentProgram);
      this.isActive = false;
    }
    updateUniforms(renderPass) {
    }
    bind(renderPass) {
      const uniforms = this.uniforms;
      uniforms.set("uProjectionMatrix", renderPass.projectionMatrix);
      uniforms.set("uCameraMatrix", renderPass.cameraMatrix);
      this.updateUniforms(renderPass);
      return this.setUniforms(renderPass);
    }
    setUniform(key, value) {
      const uniforms = this.uniforms;
      if (uniforms.has(key)) {
        uniforms.set(key, value);
        const setter = this.uniformSetters.get(key);
        setter(value);
      }
    }
    setUniforms(renderPass) {
      if (!this.program) {
        return false;
      }
      gl.useProgram(this.program);
      this.isActive = true;
      const uniforms = this.uniforms;
      for (const [name, setter] of this.uniformSetters.entries()) {
        setter(uniforms.get(name));
      }
      return true;
    }
    setAttributes(renderPass) {
      if (this.program) {
        const stride = renderPass.vertexbuffer.current.vertexByteSize;
        this.attributes.forEach((attrib) => {
          gl.vertexAttribPointer(attrib.index, attrib.size, attrib.type, attrib.normalized, stride, attrib.offset);
        });
      }
    }
    destroy() {
      DeleteShaders(this.program);
      DeleteGLTexture(this.texture);
      DeleteFramebuffer(this.framebuffer);
      this.uniforms.clear();
      this.uniformSetters.clear();
      this.attributes.clear();
      this.program = null;
      this.texture = null;
      this.framebuffer = null;
    }
  };

  // ../phaser-genesis/src/renderer/webgl1/shaders/QuadShader.ts
  var QuadShader = class extends Shader {
    constructor(config = {}) {
      config.attributes = config?.attributes || DefaultQuadAttributes;
      super(config);
    }
  };

  // ../phaser-genesis/src/renderer/webgl1/shaders/MultiTextureQuadShader.ts
  var MultiTextureQuadShader = class extends QuadShader {
    constructor(config = {}) {
      config.fragmentShader = config?.fragmentShader || MULTI_QUAD_FRAG;
      super(config);
    }
    create(fragmentShaderSource, vertexShaderSource, uniforms, attribs) {
      const maxTextures = GetMaxTextures();
      fragmentShaderSource = fragmentShaderSource.replace(/%count%/gi, `${maxTextures}`);
      super.create(fragmentShaderSource, vertexShaderSource, uniforms, attribs);
    }
    bind(renderPass) {
      this.uniforms.set("uTexture", renderPass.textures.textureIndex);
      return super.bind(renderPass);
    }
  };

  // ../phaser-genesis/src/renderer/webgl1/renderpass/ShaderStack.ts
  var ShaderStack = class {
    renderPass;
    stack;
    active;
    default;
    index;
    constructor(renderPass) {
      this.renderPass = renderPass;
      this.stack = [];
    }
    get current() {
      return this.stack[this.index];
    }
    add(shader, textureID) {
      const entry = { shader, textureID };
      this.index++;
      if (this.index === this.stack.length) {
        this.stack.push(entry);
      } else {
        this.stack[this.index] = entry;
      }
      return entry;
    }
    bindDefault() {
      this.index = 0;
      this.bind(this.default);
    }
    bind(entry) {
      if (!entry) {
        entry = this.current;
      }
      if (!entry.shader.isActive) {
        const success = entry.shader.bind(this.renderPass, entry.textureID);
        if (success) {
          entry.shader.setAttributes(this.renderPass);
          if (this.active && this.active !== entry.shader) {
            this.active.isActive = false;
          }
          this.active = entry.shader;
        }
      }
    }
    pop() {
      this.index--;
      this.bind();
    }
    set(shader, textureID) {
      const entry = this.add(shader, textureID);
      this.bind(entry);
    }
    setDefault(shader, textureID) {
      const entry = { shader, textureID };
      this.stack[0] = entry;
      this.index = 0;
      this.default = entry;
    }
  };

  // ../phaser-genesis/node_modules/bitecs/dist/index.mjs
  var TYPES_ENUM = {
    i8: "i8",
    ui8: "ui8",
    ui8c: "ui8c",
    i16: "i16",
    ui16: "ui16",
    i32: "i32",
    ui32: "ui32",
    f32: "f32",
    f64: "f64",
    eid: "eid"
  };
  var TYPES_NAMES = {
    i8: "Int8",
    ui8: "Uint8",
    ui8c: "Uint8Clamped",
    i16: "Int16",
    ui16: "Uint16",
    i32: "Int32",
    ui32: "Uint32",
    eid: "Uint32",
    f32: "Float32",
    f64: "Float64"
  };
  var TYPES = {
    i8: Int8Array,
    ui8: Uint8Array,
    ui8c: Uint8ClampedArray,
    i16: Int16Array,
    ui16: Uint16Array,
    i32: Int32Array,
    ui32: Uint32Array,
    f32: Float32Array,
    f64: Float64Array,
    eid: Uint32Array
  };
  var UNSIGNED_MAX = {
    uint8: 2 ** 8,
    uint16: 2 ** 16,
    uint32: 2 ** 32
  };
  var roundToMultiple = (mul) => (x) => Math.ceil(x / mul) * mul;
  var roundToMultiple4 = roundToMultiple(4);
  var $storeRef = Symbol("storeRef");
  var $storeSize = Symbol("storeSize");
  var $storeMaps = Symbol("storeMaps");
  var $storeFlattened = Symbol("storeFlattened");
  var $storeBase = Symbol("storeBase");
  var $storeType = Symbol("storeType");
  var $storeArrayCounts = Symbol("storeArrayCount");
  var $storeSubarrays = Symbol("storeSubarrays");
  var $subarrayCursors = Symbol("subarrayCursors");
  var $subarray = Symbol("subarray");
  var $subarrayFrom = Symbol("subarrayFrom");
  var $subarrayTo = Symbol("subarrayTo");
  var $parentArray = Symbol("subStore");
  var $tagStore = Symbol("tagStore");
  var $queryShadow = Symbol("queryShadow");
  var $serializeShadow = Symbol("serializeShadow");
  var $indexType = Symbol("indexType");
  var $indexBytes = Symbol("indexBytes");
  var $isEidType = Symbol("isEidType");
  var stores = {};
  var resize = (ta, size) => {
    const newBuffer = new ArrayBuffer(size * ta.BYTES_PER_ELEMENT);
    const newTa = new ta.constructor(newBuffer);
    newTa.set(ta, 0);
    return newTa;
  };
  var createShadow = (store, key) => {
    if (!ArrayBuffer.isView(store)) {
      const shadowStore = store[$parentArray].slice(0).fill(0);
      store[key] = store.map((_, eid) => {
        const from = store[eid][$subarrayFrom];
        const to = store[eid][$subarrayTo];
        return shadowStore.subarray(from, to);
      });
    } else {
      store[key] = store.slice(0).fill(0);
    }
  };
  var resizeSubarray = (metadata, store, size) => {
    const cursors = metadata[$subarrayCursors];
    let type = store[$storeType];
    const length = store[0].length;
    const indexType = length <= UNSIGNED_MAX.uint8 ? "ui8" : length <= UNSIGNED_MAX.uint16 ? "ui16" : "ui32";
    const arrayCount = metadata[$storeArrayCounts][type];
    const summedLength = Array(arrayCount).fill(0).reduce((a, p) => a + length, 0);
    const array = new TYPES[type](roundToMultiple4(summedLength * size));
    array.set(metadata[$storeSubarrays][type]);
    metadata[$storeSubarrays][type] = array;
    array[$indexType] = TYPES_NAMES[indexType];
    array[$indexBytes] = TYPES[indexType].BYTES_PER_ELEMENT;
    const start = cursors[type];
    let end = 0;
    for (let eid = 0; eid < size; eid++) {
      const from = cursors[type] + eid * length;
      const to = from + length;
      store[eid] = metadata[$storeSubarrays][type].subarray(from, to);
      store[eid][$subarrayFrom] = from;
      store[eid][$subarrayTo] = to;
      store[eid][$subarray] = true;
      store[eid][$indexType] = TYPES_NAMES[indexType];
      store[eid][$indexBytes] = TYPES[indexType].BYTES_PER_ELEMENT;
      end = to;
    }
    cursors[type] = end;
    store[$parentArray] = metadata[$storeSubarrays][type].subarray(start, end);
  };
  var resizeRecursive = (metadata, store, size) => {
    Object.keys(store).forEach((key) => {
      const ta = store[key];
      if (Array.isArray(ta)) {
        resizeSubarray(metadata, ta, size);
        store[$storeFlattened].push(ta);
      } else if (ArrayBuffer.isView(ta)) {
        store[key] = resize(ta, size);
        store[$storeFlattened].push(store[key]);
      } else if (typeof ta === "object") {
        resizeRecursive(metadata, store[key], size);
      }
    });
  };
  var resizeStore = (store, size) => {
    if (store[$tagStore])
      return;
    store[$storeSize] = size;
    store[$storeFlattened].length = 0;
    Object.keys(store[$subarrayCursors]).forEach((k) => {
      store[$subarrayCursors][k] = 0;
    });
    resizeRecursive(store, store, size);
  };
  var resetStoreFor = (store, eid) => {
    if (store[$storeFlattened]) {
      store[$storeFlattened].forEach((ta) => {
        if (ArrayBuffer.isView(ta))
          ta[eid] = 0;
        else
          ta[eid].fill(0);
      });
    }
  };
  var createTypeStore = (type, length) => {
    const totalBytes = length * TYPES[type].BYTES_PER_ELEMENT;
    const buffer = new ArrayBuffer(totalBytes);
    const store = new TYPES[type](buffer);
    store[$isEidType] = type === TYPES_ENUM.eid;
    return store;
  };
  var createArrayStore = (metadata, type, length) => {
    const size = metadata[$storeSize];
    const store = Array(size).fill(0);
    store[$storeType] = type;
    store[$isEidType] = type === TYPES_ENUM.eid;
    const cursors = metadata[$subarrayCursors];
    const indexType = length < UNSIGNED_MAX.uint8 ? "ui8" : length < UNSIGNED_MAX.uint16 ? "ui16" : "ui32";
    if (!length)
      throw new Error("bitECS - Must define component array length");
    if (!TYPES[type])
      throw new Error(`bitECS - Invalid component array property type ${type}`);
    if (!metadata[$storeSubarrays][type]) {
      const arrayCount = metadata[$storeArrayCounts][type];
      const summedLength = Array(arrayCount).fill(0).reduce((a, p) => a + length, 0);
      const array = new TYPES[type](roundToMultiple4(summedLength * size));
      metadata[$storeSubarrays][type] = array;
      array[$indexType] = TYPES_NAMES[indexType];
      array[$indexBytes] = TYPES[indexType].BYTES_PER_ELEMENT;
    }
    const start = cursors[type];
    let end = 0;
    for (let eid = 0; eid < size; eid++) {
      const from = cursors[type] + eid * length;
      const to = from + length;
      store[eid] = metadata[$storeSubarrays][type].subarray(from, to);
      store[eid][$subarrayFrom] = from;
      store[eid][$subarrayTo] = to;
      store[eid][$subarray] = true;
      store[eid][$indexType] = TYPES_NAMES[indexType];
      store[eid][$indexBytes] = TYPES[indexType].BYTES_PER_ELEMENT;
      end = to;
    }
    cursors[type] = end;
    store[$parentArray] = metadata[$storeSubarrays][type].subarray(start, end);
    return store;
  };
  var isArrayType = (x) => Array.isArray(x) && typeof x[0] === "string" && typeof x[1] === "number";
  var createStore = (schema, size) => {
    const $store = Symbol("store");
    if (!schema || !Object.keys(schema).length) {
      stores[$store] = {
        [$storeSize]: size,
        [$tagStore]: true,
        [$storeBase]: () => stores[$store]
      };
      return stores[$store];
    }
    schema = JSON.parse(JSON.stringify(schema));
    const arrayCounts = {};
    const collectArrayCounts = (s) => {
      const keys = Object.keys(s);
      for (const k of keys) {
        if (isArrayType(s[k])) {
          if (!arrayCounts[s[k][0]])
            arrayCounts[s[k][0]] = 0;
          arrayCounts[s[k][0]]++;
        } else if (s[k] instanceof Object) {
          collectArrayCounts(s[k]);
        }
      }
    };
    collectArrayCounts(schema);
    const metadata = {
      [$storeSize]: size,
      [$storeMaps]: {},
      [$storeSubarrays]: {},
      [$storeRef]: $store,
      [$subarrayCursors]: Object.keys(TYPES).reduce((a, type) => ({ ...a, [type]: 0 }), {}),
      [$storeFlattened]: [],
      [$storeArrayCounts]: arrayCounts
    };
    if (schema instanceof Object && Object.keys(schema).length) {
      const recursiveTransform = (a, k) => {
        if (typeof a[k] === "string") {
          a[k] = createTypeStore(a[k], size);
          a[k][$storeBase] = () => stores[$store];
          metadata[$storeFlattened].push(a[k]);
        } else if (isArrayType(a[k])) {
          const [type, length] = a[k];
          a[k] = createArrayStore(metadata, type, length);
          a[k][$storeBase] = () => stores[$store];
          metadata[$storeFlattened].push(a[k]);
        } else if (a[k] instanceof Object) {
          a[k] = Object.keys(a[k]).reduce(recursiveTransform, a[k]);
        }
        return a;
      };
      stores[$store] = Object.assign(Object.keys(schema).reduce(recursiveTransform, schema), metadata);
      stores[$store][$storeBase] = () => stores[$store];
      return stores[$store];
    }
  };
  var SparseSet = () => {
    const dense = [];
    const sparse = [];
    dense.sort = function(comparator) {
      const result = Array.prototype.sort.call(this, comparator);
      for (let i = 0; i < dense.length; i++) {
        sparse[dense[i]] = i;
      }
      return result;
    };
    const has = (val) => dense[sparse[val]] === val;
    const add = (val) => {
      if (has(val))
        return;
      sparse[val] = dense.push(val) - 1;
    };
    const remove = (val) => {
      if (!has(val))
        return;
      const index = sparse[val];
      const swapped = dense.pop();
      if (swapped !== val) {
        dense[index] = swapped;
        sparse[swapped] = index;
      }
    };
    return {
      add,
      remove,
      has,
      sparse,
      dense
    };
  };
  var newEntities = new Map();
  var $entityMasks = Symbol("entityMasks");
  var $entityComponents = Symbol("entityComponents");
  var $entitySparseSet = Symbol("entitySparseSet");
  var $entityArray = Symbol("entityArray");
  var $entityIndices = Symbol("entityIndices");
  var $removedEntities = Symbol("removedEntities");
  var defaultSize = 1e5;
  var globalEntityCursor = 0;
  var globalSize = defaultSize;
  var getGlobalSize = () => globalSize;
  var removed = [];
  var resetGlobals = () => {
    globalSize = defaultSize;
    globalEntityCursor = 0;
    removed.length = 0;
  };
  var getDefaultSize = () => defaultSize;
  var setDefaultSize = (size) => {
    defaultSize = size;
    resetGlobals();
  };
  var getEntityCursor = () => globalEntityCursor;
  var eidToWorld = new Map();
  var addEntity = (world2) => {
    const eid = removed.length > 0 ? removed.shift() : globalEntityCursor++;
    world2[$entitySparseSet].add(eid);
    eidToWorld.set(eid, world2);
    if (globalEntityCursor >= defaultSize) {
      console.error(`bitECS - max entities of ${defaultSize} reached, increase with setDefaultSize function.`);
    }
    world2[$notQueries].forEach((q) => {
      const match = queryCheckEntity(world2, q, eid);
      if (match)
        queryAddEntity(q, eid);
    });
    world2[$entityComponents].set(eid, new Set());
    return eid;
  };
  var removeEntity = (world2, eid) => {
    if (!world2[$entitySparseSet].has(eid))
      return;
    world2[$queries].forEach((q) => {
      queryRemoveEntity(world2, q, eid);
    });
    removed.push(eid);
    world2[$entitySparseSet].remove(eid);
    world2[$entityComponents].delete(eid);
    for (let i = 0; i < world2[$entityMasks].length; i++)
      world2[$entityMasks][i][eid] = 0;
  };
  function Any(...comps) {
    return function QueryAny() {
      return comps;
    };
  }
  function All(...comps) {
    return function QueryAll() {
      return comps;
    };
  }
  function None(...comps) {
    return function QueryNone() {
      return comps;
    };
  }
  var $queries = Symbol("queries");
  var $notQueries = Symbol("notQueries");
  var $queryAny = Symbol("queryAny");
  var $queryAll = Symbol("queryAll");
  var $queryNone = Symbol("queryNone");
  var $queryMap = Symbol("queryMap");
  var $dirtyQueries = Symbol("$dirtyQueries");
  var $queryComponents = Symbol("queryComponents");
  var $enterQuery = Symbol("enterQuery");
  var $exitQuery = Symbol("exitQuery");
  var registerQuery = (world2, query) => {
    const components2 = [];
    const notComponents = [];
    const changedComponents = [];
    query[$queryComponents].forEach((c) => {
      if (typeof c === "function") {
        const [comp, mod] = c();
        if (!world2[$componentMap].has(comp))
          registerComponent(world2, comp);
        if (mod === "not") {
          notComponents.push(comp);
        }
        if (mod === "changed") {
          changedComponents.push(comp);
          components2.push(comp);
        }
      } else {
        if (!world2[$componentMap].has(c))
          registerComponent(world2, c);
        components2.push(c);
      }
    });
    const mapComponents = (c) => world2[$componentMap].get(c);
    const allComponents = components2.concat(notComponents).map(mapComponents);
    const sparseSet = SparseSet();
    const archetypes = [];
    const changed = [];
    const toRemove = SparseSet();
    const entered = [];
    const exited = [];
    const generations = allComponents.map((c) => c.generationId).reduce((a, v) => {
      if (a.includes(v))
        return a;
      a.push(v);
      return a;
    }, []);
    const reduceBitflags = (a, c) => {
      if (!a[c.generationId])
        a[c.generationId] = 0;
      a[c.generationId] |= c.bitflag;
      return a;
    };
    const masks = components2.map(mapComponents).reduce(reduceBitflags, {});
    const notMasks = notComponents.map(mapComponents).reduce(reduceBitflags, {});
    const hasMasks = allComponents.reduce(reduceBitflags, {});
    const flatProps = components2.filter((c) => !c[$tagStore]).map((c) => Object.getOwnPropertySymbols(c).includes($storeFlattened) ? c[$storeFlattened] : [c]).reduce((a, v) => a.concat(v), []);
    const shadows = flatProps.map((prop) => {
      const $ = Symbol();
      createShadow(prop, $);
      return prop[$];
    }, []);
    const q = Object.assign(sparseSet, {
      archetypes,
      changed,
      components: components2,
      notComponents,
      changedComponents,
      allComponents,
      masks,
      notMasks,
      hasMasks,
      generations,
      flatProps,
      toRemove,
      entered,
      exited,
      shadows
    });
    world2[$queryMap].set(query, q);
    world2[$queries].add(q);
    allComponents.forEach((c) => {
      c.queries.add(q);
    });
    if (notComponents.length)
      world2[$notQueries].add(q);
    for (let eid = 0; eid < getEntityCursor(); eid++) {
      if (!world2[$entitySparseSet].has(eid))
        continue;
      const match = queryCheckEntity(world2, q, eid);
      if (match)
        queryAddEntity(q, eid);
    }
  };
  var diff = (q, clearDiff) => {
    if (clearDiff)
      q.changed = [];
    const { flatProps, shadows } = q;
    for (let i = 0; i < q.dense.length; i++) {
      const eid = q.dense[i];
      let dirty = false;
      for (let pid = 0; pid < flatProps.length; pid++) {
        const prop = flatProps[pid];
        const shadow = shadows[pid];
        if (ArrayBuffer.isView(prop[eid])) {
          for (let i2 = 0; i2 < prop[eid].length; i2++) {
            if (prop[eid][i2] !== shadow[eid][i2]) {
              dirty = true;
              shadow[eid][i2] = prop[eid][i2];
              break;
            }
          }
        } else {
          if (prop[eid] !== shadow[eid]) {
            dirty = true;
            shadow[eid] = prop[eid];
          }
        }
      }
      if (dirty)
        q.changed.push(eid);
    }
    return q.changed;
  };
  var flatten = (a, v) => a.concat(v);
  var aggregateComponentsFor = (mod) => (x) => x.filter((f) => f.name === mod().constructor.name).reduce(flatten);
  var getAnyComponents = aggregateComponentsFor(Any);
  var getAllComponents = aggregateComponentsFor(All);
  var getNoneComponents = aggregateComponentsFor(None);
  var defineQuery = (...args) => {
    let components2;
    let any, all, none;
    if (Array.isArray(args[0])) {
      components2 = args[0];
    } else {
      any = getAnyComponents(args);
      all = getAllComponents(args);
      none = getNoneComponents(args);
    }
    if (components2 === void 0 || components2[$componentMap] !== void 0) {
      return (world2) => world2 ? world2[$entityArray] : components2[$entityArray];
    }
    const query = function(world2, clearDiff = true) {
      if (!world2[$queryMap].has(query))
        registerQuery(world2, query);
      const q = world2[$queryMap].get(query);
      commitRemovals(world2);
      if (q.changedComponents.length)
        return diff(q, clearDiff);
      return q.dense;
    };
    query[$queryComponents] = components2;
    query[$queryAny] = any;
    query[$queryAll] = all;
    query[$queryNone] = none;
    return query;
  };
  var queryCheckEntity = (world2, q, eid) => {
    const { masks, notMasks, generations } = q;
    let or = 0;
    for (let i = 0; i < generations.length; i++) {
      const generationId = generations[i];
      const qMask = masks[generationId];
      const qNotMask = notMasks[generationId];
      const eMask = world2[$entityMasks][generationId][eid];
      if (qNotMask && (eMask & qNotMask) !== 0) {
        return false;
      }
      if (qMask && (eMask & qMask) !== qMask) {
        return false;
      }
    }
    return true;
  };
  var queryAddEntity = (q, eid) => {
    if (q.has(eid))
      return;
    q.add(eid);
    q.entered.push(eid);
  };
  var queryCommitRemovals = (q) => {
    for (let i = q.toRemove.dense.length - 1; i >= 0; i--) {
      const eid = q.toRemove.dense[i];
      q.toRemove.remove(eid);
      q.remove(eid);
    }
  };
  var commitRemovals = (world2) => {
    world2[$dirtyQueries].forEach(queryCommitRemovals);
    world2[$dirtyQueries].clear();
  };
  var queryRemoveEntity = (world2, q, eid) => {
    if (!q.has(eid) || q.toRemove.has(eid))
      return;
    q.toRemove.add(eid);
    world2[$dirtyQueries].add(q);
    q.exited.push(eid);
  };
  var $componentMap = Symbol("componentMap");
  var components = [];
  var defineComponent = (schema) => {
    const component = createStore(schema, getDefaultSize());
    if (schema && Object.keys(schema).length)
      components.push(component);
    return component;
  };
  var incrementBitflag = (world2) => {
    world2[$bitflag] *= 2;
    if (world2[$bitflag] >= 2 ** 31) {
      world2[$bitflag] = 1;
      world2[$entityMasks].push(new Uint32Array(world2[$size]));
    }
  };
  var registerComponent = (world2, component) => {
    if (!component)
      throw new Error(`bitECS - Cannot register null or undefined component`);
    const queries = new Set();
    const notQueries = new Set();
    const changedQueries = new Set();
    world2[$queries].forEach((q) => {
      if (q.allComponents.includes(component)) {
        queries.add(q);
      }
    });
    world2[$componentMap].set(component, {
      generationId: world2[$entityMasks].length - 1,
      bitflag: world2[$bitflag],
      store: component,
      queries,
      notQueries,
      changedQueries
    });
    if (component[$storeSize] < world2[$size]) {
      resizeStore(component, world2[$size]);
    }
    incrementBitflag(world2);
  };
  var hasComponent = (world2, component, eid) => {
    const registeredComponent = world2[$componentMap].get(component);
    if (!registeredComponent)
      return;
    const { generationId, bitflag } = registeredComponent;
    const mask = world2[$entityMasks][generationId][eid];
    return (mask & bitflag) === bitflag;
  };
  var addComponent = (world2, component, eid, reset = true) => {
    if (!world2[$componentMap].has(component))
      registerComponent(world2, component);
    if (hasComponent(world2, component, eid))
      return;
    const c = world2[$componentMap].get(component);
    const { generationId, bitflag, queries, notQueries } = c;
    world2[$entityMasks][generationId][eid] |= bitflag;
    queries.forEach((q) => {
      const match = queryCheckEntity(world2, q, eid);
      if (match)
        queryAddEntity(q, eid);
      if (!match)
        queryRemoveEntity(world2, q, eid);
    });
    world2[$entityComponents].get(eid).add(component);
    if (reset)
      resetStoreFor(component, eid);
  };
  var removeComponent = (world2, component, eid, reset = false) => {
    const c = world2[$componentMap].get(component);
    const { generationId, bitflag, queries, notQueries } = c;
    if (!(world2[$entityMasks][generationId][eid] & bitflag))
      return;
    world2[$entityMasks][generationId][eid] &= ~bitflag;
    queries.forEach((q) => {
      const match = queryCheckEntity(world2, q, eid);
      if (match)
        queryAddEntity(q, eid);
      if (!match)
        queryRemoveEntity(world2, q, eid);
    });
    world2[$entityComponents].get(eid).delete(component);
    if (reset)
      resetStoreFor(component, eid);
  };
  var $size = Symbol("size");
  var $resizeThreshold = Symbol("resizeThreshold");
  var $bitflag = Symbol("bitflag");
  var $archetypes = Symbol("archetypes");
  var $localEntities = Symbol("localEntities");
  var worlds = [];
  var createWorld = () => {
    const world2 = {};
    resetWorld(world2);
    worlds.push(world2);
    return world2;
  };
  var resetWorld = (world2) => {
    const size = getGlobalSize();
    world2[$size] = size;
    if (world2[$entityArray])
      world2[$entityArray].forEach((eid) => removeEntity(world2, eid));
    world2[$entityMasks] = [new Uint32Array(size)];
    world2[$entityComponents] = new Map();
    world2[$archetypes] = [];
    world2[$entitySparseSet] = SparseSet();
    world2[$entityArray] = world2[$entitySparseSet].dense;
    world2[$bitflag] = 1;
    world2[$componentMap] = new Map();
    world2[$queryMap] = new Map();
    world2[$queries] = new Set();
    world2[$notQueries] = new Set();
    world2[$dirtyQueries] = new Set();
    world2[$localEntities] = new Map();
    return world2;
  };
  var Types = TYPES_ENUM;

  // ../phaser-genesis/src/components/transform/Transform2DComponent.ts
  var TRANSFORM = {
    IS_ROOT: 0,
    X: 1,
    Y: 2,
    ROTATION: 3,
    SCALE_X: 4,
    SCALE_Y: 5,
    SKEW_X: 6,
    SKEW_Y: 7,
    AXIS_ALIGNED: 8,
    FRAME_X1: 9,
    FRAME_Y1: 10,
    FRAME_X2: 11,
    FRAME_Y2: 12,
    LOCAL_A: 13,
    LOCAL_B: 14,
    LOCAL_C: 15,
    LOCAL_D: 16,
    LOCAL_TX: 17,
    LOCAL_TY: 18,
    BOUNDS_X1: 19,
    BOUNDS_Y1: 20,
    BOUNDS_X2: 21,
    BOUNDS_Y2: 22,
    ORIGIN_X: 23,
    ORIGIN_Y: 24,
    WORLD_A: 25,
    WORLD_B: 26,
    WORLD_C: 27,
    WORLD_D: 28,
    WORLD_TX: 29,
    WORLD_TY: 30,
    FRAME_WIDTH: 31,
    FRAME_HEIGHT: 32,
    IN_VIEW: 33,
    UPDATED: 34
  };
  var Transform2DComponent = defineComponent({
    data: [Types.f32, 35]
  });

  // ../phaser-genesis/src/GameObjectWorld.ts
  setDefaultSize(25e5);
  var world = createWorld();
  var GameObjectWorld = world;

  // ../phaser-genesis/src/components/transform/AddTransform2DComponent.ts
  function AddTransform2DComponent(id) {
    addComponent(GameObjectWorld, Transform2DComponent, id);
    const data = Transform2DComponent.data[id];
    data[TRANSFORM.SCALE_X] = 1;
    data[TRANSFORM.SCALE_Y] = 1;
    data[TRANSFORM.AXIS_ALIGNED] = 1;
  }

  // ../phaser-genesis/src/components/dirty/DirtyComponent.ts
  var DIRTY = {
    TRANSFORM: 0,
    CHILD_TRANSFORM: 1,
    COLOR: 2,
    CHILD_COLOR: 3,
    CHILD_CACHE: 4,
    WORLD_TRANSFORM: 5,
    DISPLAY_LIST: 6
  };
  var DirtyComponent = defineComponent({
    data: [Types.ui8, 7]
  });

  // ../phaser-genesis/src/components/dirty/ClearDirtyTransform.ts
  function ClearDirtyTransform(id) {
    DirtyComponent.data[id][DIRTY.TRANSFORM] = 0;
  }

  // ../phaser-genesis/src/components/dirty/HasDirtyTransform.ts
  function HasDirtyTransform(id) {
    return !!DirtyComponent.data[id][DIRTY.TRANSFORM];
  }

  // ../phaser-genesis/src/utils/NOOP.ts
  function NOOP() {
  }

  // ../phaser-genesis/src/math/mat4/Matrix4.ts
  var Matrix4 = class {
    data;
    onChange;
    constructor(src) {
      const data = new Float32Array(16);
      this.data = data;
      this.onChange = NOOP;
      if (src) {
        if (Array.isArray(src)) {
          this.fromArray(src);
        } else {
          this.fromArray(src.data);
        }
      } else {
        data[0] = 1;
        data[5] = 1;
        data[10] = 1;
        data[15] = 1;
      }
    }
    set(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
      this.data.set([
        m00,
        m01,
        m02,
        m03,
        m10,
        m11,
        m12,
        m13,
        m20,
        m21,
        m22,
        m23,
        m30,
        m31,
        m32,
        m33
      ]);
      this.onChange(this);
      return this;
    }
    toArray(dst = [], index = 0) {
      const data = this.data;
      for (let i = 0; i < 16; i++) {
        dst[index + i] = data[i];
      }
      return dst;
    }
    fromArray(src, index = 0) {
      const data = this.data;
      for (let i = 0; i < 16; i++) {
        data[i] = src[index + i];
      }
      this.onChange(this);
      return this;
    }
    toString() {
      return "[ mat4=" + this.data.join(", ") + " ]";
    }
    destroy() {
      this.onChange = NOOP;
      this.data = null;
    }
  };

  // ../phaser-genesis/src/components/transform/SetBounds.ts
  function SetBounds(id, x, y, right, bottom) {
    const data = Transform2DComponent.data[id];
    data[TRANSFORM.BOUNDS_X1] = x;
    data[TRANSFORM.BOUNDS_Y1] = y;
    data[TRANSFORM.BOUNDS_X2] = right;
    data[TRANSFORM.BOUNDS_Y2] = bottom;
  }

  // ../phaser-genesis/src/GameInstance.ts
  var instance;
  var frame = 0;
  var elapsed = 0;
  var GameInstance = {
    get: () => {
      return instance;
    },
    set: (game2) => {
      instance = game2;
    },
    getFrame: () => {
      return frame;
    },
    setFrame: (current) => {
      frame = current;
    },
    getElapsed: () => {
      return elapsed;
    },
    setElapsed: (current) => {
      elapsed = current;
    }
  };

  // ../phaser-genesis/src/components/hierarchy/HierarchyComponent.ts
  var HIERARCHY = {
    WORLD: 0,
    PARENT: 1,
    NEXT: 2,
    PREV: 3,
    FIRST: 4,
    LAST: 5,
    NUM_CHILDREN: 6,
    DEPTH: 7
  };
  var HierarchyComponent = defineComponent({
    data: [Types.ui32, 8]
  });

  // ../phaser-genesis/src/components/hierarchy/GetParentID.ts
  function GetParentID(id) {
    return HierarchyComponent.data[id][HIERARCHY.PARENT];
  }

  // ../phaser-genesis/src/components/dirty/SetDirtyChildCache.ts
  function SetDirtyChildCache(id) {
    DirtyComponent.data[id][DIRTY.CHILD_CACHE] = 1;
  }

  // ../phaser-genesis/src/components/dirty/SetDirtyChildTransform.ts
  function SetDirtyChildTransform(id) {
    DirtyComponent.data[id][DIRTY.CHILD_TRANSFORM] = 1;
  }

  // ../phaser-genesis/src/components/permissions/PermissionsComponent.ts
  var PERMISSION = {
    VISIBLE: 0,
    VISIBLE_CHILDREN: 1,
    WILL_UPDATE: 2,
    WILL_UPDATE_CHILDREN: 3,
    WILL_RENDER: 4,
    WILL_RENDER_CHILDREN: 5,
    WILL_CACHE_CHILDREN: 6,
    WILL_TRANSFORM_CHILDREN: 7,
    WILL_COLOR_CHILDREN: 8,
    CUSTOM_DISPLAY_LIST: 9
  };
  var PermissionsComponent = defineComponent({
    data: [Types.ui8, 10]
  });

  // ../phaser-genesis/src/components/permissions/WillCacheChildren.ts
  function WillCacheChildren(id) {
    return !!PermissionsComponent.data[id][PERMISSION.WILL_CACHE_CHILDREN];
  }

  // ../phaser-genesis/src/components/dirty/SetDirtyParents.ts
  var prevParentID;
  var prevFrame;
  function SetDirtyParents(childID) {
    let id = GetParentID(childID);
    const frame2 = GameInstance.getFrame();
    if (id === prevParentID && frame2 === prevFrame) {
      return;
    }
    prevParentID = id;
    prevFrame = frame2;
    while (id) {
      SetDirtyChildTransform(id);
      if (WillCacheChildren(id)) {
        SetDirtyChildCache(id);
      }
      id = GetParentID(id);
    }
  }

  // ../phaser-genesis/src/components/dirty/SetDirtyTransform.ts
  function SetDirtyTransform(id) {
    DirtyComponent.data[id][DIRTY.TRANSFORM] = 1;
    SetDirtyParents(id);
  }

  // ../phaser-genesis/src/components/transform/UpdateExtent.ts
  function UpdateExtent(id, width, height) {
    const data = Transform2DComponent.data[id];
    const x = -data[TRANSFORM.ORIGIN_X] * width;
    const y = -data[TRANSFORM.ORIGIN_Y] * height;
    data[TRANSFORM.FRAME_X1] = x;
    data[TRANSFORM.FRAME_Y1] = y;
    data[TRANSFORM.FRAME_X2] = x + width;
    data[TRANSFORM.FRAME_Y2] = y + height;
    data[TRANSFORM.FRAME_WIDTH] = width;
    data[TRANSFORM.FRAME_HEIGHT] = height;
    SetDirtyTransform(id);
  }

  // ../phaser-genesis/src/components/transform/Size.ts
  var Size = class {
    id;
    _data;
    constructor(id, width = 0, height = 0) {
      this.id = id;
      this._data = Transform2DComponent.data[id];
      this.set(width, height);
    }
    set(width, height = width) {
      this.width = width;
      this.height = height;
      return this;
    }
    set width(value) {
      UpdateExtent(this.id, value, this.height);
    }
    get width() {
      return this._data[TRANSFORM.FRAME_WIDTH];
    }
    set height(value) {
      UpdateExtent(this.id, this.width, value);
    }
    get height() {
      return this._data[TRANSFORM.FRAME_HEIGHT];
    }
    set x(value) {
      this.width = value;
    }
    get x() {
      return this.width;
    }
    set y(value) {
      this.height = value;
    }
    get y() {
      return this.height;
    }
    destroy() {
      this._data = null;
    }
  };

  // ../phaser-genesis/src/camera/StaticCamera.ts
  var StaticCamera = class {
    id = addEntity(GameObjectWorld);
    type = "WorldCamera";
    name = "";
    size;
    matrix;
    _data;
    constructor(width, height) {
      const id = this.id;
      AddTransform2DComponent(id);
      this.matrix = new Matrix4();
      this.size = new Size(id, width, height);
      this._data = Transform2DComponent.data[id];
      this.reset(width, height);
    }
    updateBounds() {
      const id = this.id;
      if (HasDirtyTransform(id)) {
        const w = this.size.width;
        const h = this.size.height;
        const ox = w / 2;
        const oy = h / 2;
        const bx = ox - w / 2;
        const by = oy - h / 2;
        SetBounds(id, bx, by, bx + w, by + h);
        return true;
      }
      return false;
    }
    update() {
      const id = this.id;
      if (HasDirtyTransform(id)) {
        ClearDirtyTransform(id);
        return true;
      }
      return true;
    }
    getBoundsX() {
      return this._data[TRANSFORM.BOUNDS_X1];
    }
    getBoundsY() {
      return this._data[TRANSFORM.BOUNDS_Y1];
    }
    getBoundsRight() {
      return this._data[TRANSFORM.BOUNDS_X2];
    }
    getBoundsBottom() {
      return this._data[TRANSFORM.BOUNDS_Y2];
    }
    getMatrix() {
      return this.matrix.data;
    }
    reset(width, height) {
      this.size.set(width, height);
    }
    destroy() {
      const id = this.id;
      removeComponent(GameObjectWorld, Transform2DComponent, id);
      removeEntity(GameObjectWorld, id);
    }
  };

  // ../phaser-genesis/src/renderer/webgl1/renderpass/CreateTempTextures.ts
  function CreateTempTextures() {
    let maxGPUTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
    let maxCombinedGPUTextures = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
    console.log("MAX GPU", maxGPUTextures, "MAX COMBINED", maxCombinedGPUTextures);
    const maxConfigTextures = GetMaxTextures();
    if (maxConfigTextures === 0 || maxConfigTextures > maxGPUTextures) {
      SetMaxTextures(maxGPUTextures);
    } else {
      maxGPUTextures = maxConfigTextures;
    }
    const textures = [];
    for (let i = 0; i < maxGPUTextures; i++) {
      const tempTexture = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, tempTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));
      textures.push([i, tempTexture]);
    }
    return textures;
  }

  // ../phaser-genesis/src/textures/WhiteTexture.ts
  var instance2;
  var WhiteTexture = {
    get: () => {
      return instance2;
    },
    set: (texture) => {
      instance2 = texture;
    }
  };

  // ../phaser-genesis/src/renderer/webgl1/renderpass/TextureStack.ts
  var TextureStack = class {
    renderPass;
    textures;
    tempTextures;
    textureIndex;
    maxTextures;
    constructor(renderPass) {
      this.renderPass = renderPass;
    }
    bind(texture, index = 1) {
      const binding = texture.binding;
      binding.bind(index);
      gl.activeTexture(gl.TEXTURE0 + index);
      gl.bindTexture(gl.TEXTURE_2D, binding.texture);
    }
    unbind(index = 1) {
      gl.activeTexture(gl.TEXTURE0 + index);
      gl.bindTexture(gl.TEXTURE_2D, this.tempTextures[index]);
    }
    unbindTexture(texture) {
      const index = texture.binding.textureUnit;
      const binding = texture.binding;
      binding.unbind();
      gl.activeTexture(gl.TEXTURE0 + index);
      gl.bindTexture(gl.TEXTURE_2D, this.tempTextures[index]);
    }
    setWhite() {
      return this.set(WhiteTexture.get());
    }
    set(texture) {
      if (!texture.binding) {
        return -1;
      }
      const binding = texture.binding;
      const textures = this.textures;
      if (!binding.isBound) {
        if (textures.size === this.maxTextures) {
          Flush(this.renderPass);
          this.clear();
        }
        const textureUnit = textures.size;
        gl.activeTexture(gl.TEXTURE0 + textureUnit);
        gl.bindTexture(gl.TEXTURE_2D, binding.texture);
        textures.set(textureUnit, texture);
        binding.bind(textureUnit);
      }
      return binding.textureUnit;
    }
    setDefault() {
      if (this.textures) {
        this.reset();
      }
      const tempTextures = CreateTempTextures();
      this.maxTextures = tempTextures.length;
      this.tempTextures = new Map(tempTextures);
      this.textures = new Map();
      this.textureIndex = [];
      this.tempTextures.forEach((texture, index) => {
        this.textureIndex.push(index);
      });
      this.textures.set(0, this.tempTextures[0]);
    }
    clear() {
      this.textures.forEach((texture) => texture.binding.unbind());
      this.textures.clear();
      this.textures.set(0, this.tempTextures[0]);
    }
    reset() {
      this.tempTextures.forEach((texture, index) => {
        gl.activeTexture(gl.TEXTURE0 + index);
        gl.bindTexture(gl.TEXTURE_2D, texture);
      });
      this.clear();
    }
  };

  // ../phaser-genesis/src/renderer/webgl1/buffers/DeleteGLBuffer.ts
  function DeleteGLBuffer(buffer) {
    if (gl.isBuffer(buffer)) {
      gl.deleteBuffer(buffer);
    }
  }

  // ../phaser-genesis/src/renderer/webgl1/buffers/VertexBuffer.ts
  var VertexBuffer = class {
    name;
    batchSize;
    dataSize;
    vertexElementSize;
    vertexByteSize;
    entryByteSize;
    bufferByteSize;
    data;
    vertexViewF32;
    vertexBuffer;
    entryElementSize;
    indexed = false;
    isDynamic = false;
    count = 0;
    offset = 0;
    elementsPerEntry;
    isBound = false;
    constructor(config = {}) {
      const {
        name = "VBO",
        batchSize = 1,
        dataSize = 4,
        isDynamic = true,
        elementsPerEntry = 3,
        vertexElementSize = 9
      } = config;
      this.name = name;
      this.batchSize = batchSize;
      this.dataSize = dataSize;
      this.vertexElementSize = vertexElementSize;
      this.isDynamic = isDynamic;
      this.elementsPerEntry = elementsPerEntry;
      this.vertexByteSize = vertexElementSize * dataSize;
      this.entryByteSize = this.vertexByteSize * elementsPerEntry;
      this.bufferByteSize = batchSize * this.entryByteSize;
      this.entryElementSize = this.vertexElementSize * this.elementsPerEntry;
      this.create();
    }
    resize(batchSize) {
      this.batchSize = batchSize;
      this.bufferByteSize = batchSize * this.entryByteSize;
      if (this.vertexBuffer) {
        DeleteGLBuffer(this.vertexBuffer);
      }
      this.create();
    }
    create() {
      const data = new ArrayBuffer(this.bufferByteSize);
      this.data = data;
      this.vertexViewF32 = new Float32Array(data);
      this.vertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
      const type = this.isDynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW;
      gl.bufferData(gl.ARRAY_BUFFER, data, type);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      this.isBound = false;
    }
    add(count) {
      this.count += count;
      this.offset += this.vertexElementSize * count;
    }
    reset() {
      this.count = 0;
      this.offset = 0;
    }
    canContain(count) {
      return this.count + count <= this.batchSize;
    }
    free() {
      return Math.max(0, 1 - this.count / this.batchSize);
    }
    bind() {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    }
    destroy() {
      DeleteGLBuffer(this.vertexBuffer);
      this.data = null;
      this.vertexViewF32 = null;
      this.vertexBuffer = null;
    }
  };

  // ../phaser-genesis/src/renderer/webgl1/renderpass/VertexBufferStack.ts
  var VertexBufferStack = class {
    renderPass;
    stack;
    active;
    default;
    index;
    constructor(renderPass) {
      this.renderPass = renderPass;
      this.stack = [];
    }
    get current() {
      return this.stack[this.index];
    }
    add(buffer) {
      this.index++;
      if (this.index === this.stack.length) {
        this.stack.push(buffer);
      } else {
        this.stack[this.index] = buffer;
      }
      return buffer;
    }
    bindDefault() {
      this.index = 0;
      this.bind(this.default);
    }
    bind(buffer) {
      if (!buffer) {
        buffer = this.current;
      }
      if (!buffer.isBound) {
        const indexBuffer = buffer.indexed ? buffer.indexBuffer : null;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer.vertexBuffer);
        buffer.isBound = true;
        if (this.active && this.active !== buffer) {
          this.active.isBound = false;
        }
        this.active = buffer;
      }
    }
    pop() {
      this.index--;
      this.bind();
    }
    set(buffer) {
      const entry = this.add(buffer);
      this.bind(entry);
    }
    setDefault(buffer) {
      this.stack[0] = buffer;
      this.index = 0;
      this.default = buffer;
    }
  };

  // ../phaser-genesis/src/geom/rectangle/RectangleContains.ts
  function RectangleContains(rect, x, y) {
    if (rect.width <= 0 || rect.height <= 0) {
      return false;
    }
    return rect.x <= x && rect.x + rect.width >= x && rect.y <= y && rect.y + rect.height >= y;
  }

  // ../phaser-genesis/src/geom/rectangle/Rectangle.ts
  var Rectangle = class {
    x;
    y;
    width;
    height;
    constructor(x = 0, y = 0, width = 0, height = 0) {
      this.set(x, y, width, height);
    }
    set(x = 0, y = 0, width = 0, height = 0) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      return this;
    }
    contains(x, y) {
      return RectangleContains(this, x, y);
    }
    set right(value) {
      if (value <= this.x) {
        this.width = 0;
      } else {
        this.width = value - this.x;
      }
    }
    get right() {
      return this.x + this.width;
    }
    set bottom(value) {
      if (value <= this.y) {
        this.height = 0;
      } else {
        this.height = value - this.y;
      }
    }
    get bottom() {
      return this.y + this.height;
    }
  };

  // ../phaser-genesis/src/geom/rectangle/RectangleEquals.ts
  function RectangleEquals(rect, toCompare) {
    return rect.x === toCompare.x && rect.y === toCompare.y && rect.width === toCompare.width && rect.height === toCompare.height;
  }

  // ../phaser-genesis/src/renderer/webgl1/renderpass/ViewportStack.ts
  var ViewportStack = class {
    renderPass;
    stack;
    active;
    default;
    index;
    constructor(renderPass) {
      this.renderPass = renderPass;
      this.stack = [];
    }
    get current() {
      return this.stack[this.index];
    }
    add(x = 0, y = 0, width = 0, height = 0) {
      const entry = new Rectangle(x, y, width, height);
      this.index++;
      if (this.index === this.stack.length) {
        this.stack.push(entry);
      } else {
        this.stack[this.index] = entry;
      }
      return entry;
    }
    bindDefault() {
      this.index = 0;
      this.bind(this.default);
    }
    bind(viewport) {
      if (!viewport) {
        viewport = this.current;
      }
      if (!this.active || !RectangleEquals(this.active, viewport)) {
        gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);
        this.active = viewport;
      }
    }
    pop() {
      this.index--;
      this.bind();
    }
    set(x = 0, y = 0, width = 0, height = 0) {
      const entry = this.add(x, y, width, height);
      this.bind(entry);
    }
    setDefault(x = 0, y = 0, width = 0, height = 0) {
      const entry = new Rectangle(x, y, width, height);
      this.stack[0] = entry;
      this.index = 0;
      this.default = entry;
    }
  };

  // ../phaser-genesis/src/renderer/webgl1/renderpass/RenderPass.ts
  var RenderPass = class {
    renderer;
    projectionMatrix;
    cameraMatrix;
    count = 0;
    prevCount = 0;
    flushTotal = 0;
    framebuffer;
    vertexbuffer;
    blendMode;
    shader;
    viewport;
    textures;
    colorMatrix;
    quadShader;
    quadCamera;
    current2DCamera;
    constructor(renderer) {
      this.renderer = renderer;
      this.projectionMatrix = new Float32Array(16);
      this.framebuffer = new FramebufferStack(this);
      this.vertexbuffer = new VertexBufferStack(this);
      this.blendMode = new BlendModeStack(this);
      this.shader = new ShaderStack(this);
      this.viewport = new ViewportStack(this);
      this.textures = new TextureStack(this);
      this.colorMatrix = new ColorMatrixStack(this);
      this.reset();
    }
    getCurrentShader() {
      return this.shader.current.shader;
    }
    flush() {
      this.prevCount = this.count;
      this.count = 0;
      this.flushTotal++;
    }
    reset() {
      const gl2 = this.renderer.gl;
      this.quadShader = new QuadShader();
      this.quadCamera = new StaticCamera(this.renderer.width, this.renderer.height);
      this.textures.setDefault();
      this.framebuffer.setDefault();
      this.blendMode.setDefault(true, gl2.ONE, gl2.ONE_MINUS_SRC_ALPHA);
      this.colorMatrix.setDefault(DEFAULT_COLOR_MATRIX, DEFAULT_COLOR_OFFSET);
      this.vertexbuffer.setDefault(new VertexBuffer({ batchSize: GetBatchSize() }));
      this.shader.setDefault(GetMaxTextures() === 1 ? new QuadShader() : new MultiTextureQuadShader());
    }
    resize(width, height) {
      Mat4Ortho(this.projectionMatrix, 0, width, height, 0, -1e3, 1e3);
      this.quadCamera.reset(width, height);
      this.viewport.setDefault(0, 0, width, height);
    }
    isCameraDirty() {
      return this.current2DCamera.isDirty;
    }
  };

  // ../phaser-genesis/src/renderer/webgl1/renderpass/Start.ts
  function Start(renderPass) {
    if (!renderPass.current2DCamera) {
      renderPass.current2DCamera = renderPass.quadCamera;
      renderPass.cameraMatrix = renderPass.quadCamera.getMatrix();
    }
    renderPass.count = 0;
    renderPass.flushTotal = 0;
    renderPass.framebuffer.bindDefault();
    renderPass.blendMode.bindDefault();
    renderPass.viewport.bindDefault();
    renderPass.vertexbuffer.bindDefault();
    renderPass.shader.bindDefault();
    renderPass.colorMatrix.bindDefault();
    return renderPass;
  }

  // ../phaser-genesis/src/renderer/RendererInstance.ts
  var instance3;
  var RendererInstance = {
    get: () => {
      return instance3;
    },
    set: (renderer) => {
      instance3 = renderer;
    }
  };

  // ../phaser-genesis/src/renderer/webgl1/WebGLRendererInstance.ts
  var instance4;
  var WebGLRendererInstance = {
    get: () => {
      return instance4;
    },
    set: (renderer) => {
      instance4 = renderer;
      RendererInstance.set(renderer);
    }
  };

  // ../phaser-genesis/src/renderer/webgl1/WebGLRenderer.ts
  var WebGLRenderer = class {
    canvas;
    gl;
    renderPass;
    clearColor = [0, 0, 0, 1];
    width;
    height;
    resolution;
    clearBeforeRender = true;
    optimizeRedraw = true;
    autoResize = true;
    contextLost = false;
    compression;
    constructor() {
      this.width = GetWidth();
      this.height = GetHeight();
      this.resolution = GetResolution();
      this.setBackgroundColor(GetBackgroundColor());
      const canvas = document.createElement("canvas");
      canvas.addEventListener("webglcontextlost", (event) => this.onContextLost(event), false);
      canvas.addEventListener("webglcontextrestored", () => this.onContextRestored(), false);
      this.canvas = canvas;
      this.initContext();
      WebGLRendererInstance.set(this);
      this.renderPass = new RenderPass(this);
      this.resize(this.width, this.height, this.resolution);
      ProcessBindingQueue();
    }
    initContext() {
      const gl2 = this.canvas.getContext("webgl", GetWebGLContext());
      GL.set(gl2);
      this.gl = gl2;
      this.compression = GetCompressedTextures(gl2);
      gl2.disable(gl2.DEPTH_TEST);
      gl2.disable(gl2.CULL_FACE);
    }
    resize(width, height, resolution = 1) {
      const calcWidth = width * resolution;
      const calcHeight = height * resolution;
      this.width = calcWidth;
      this.height = calcHeight;
      this.resolution = resolution;
      const canvas = this.canvas;
      canvas.width = calcWidth;
      canvas.height = calcHeight;
      if (this.autoResize) {
        canvas.style.width = width.toString() + "px";
        canvas.style.height = height.toString() + "px";
      }
      this.renderPass.resize(calcWidth, calcHeight);
    }
    onContextLost(event) {
      event.preventDefault();
      this.contextLost = true;
    }
    onContextRestored() {
      this.contextLost = false;
      this.initContext();
    }
    setBackgroundColor(color) {
      GetRGBArray(color, this.clearColor);
      return this;
    }
    reset() {
    }
    begin(willRedraw) {
      if (this.contextLost) {
        return;
      }
      const gl2 = this.gl;
      gl2.getContextAttributes();
      ProcessBindingQueue();
      if (this.optimizeRedraw && !willRedraw) {
      }
      if (this.clearBeforeRender) {
        const cls = this.clearColor;
        gl2.clearColor(cls[0], cls[1], cls[2], cls[3]);
        gl2.clear(gl2.COLOR_BUFFER_BIT);
      }
      return Start(this.renderPass);
    }
    end() {
      End(this.renderPass);
    }
    destroy() {
      WebGLRendererInstance.set(void 0);
    }
  };

  // ../phaser-genesis/src/config/webgl/WebGL.ts
  function WebGL() {
    return () => {
      SetRenderer(WebGLRenderer);
    };
  }

  // ../phaser-genesis/src/config/webglcontext/SetWebGLContext.ts
  function SetWebGLContext(contextAttributes) {
    ConfigStore.set(CONFIG_DEFAULTS.WEBGL_CONTEXT, contextAttributes);
  }

  // ../phaser-genesis/src/events/Emit.ts
  function Emit(emitter, event, ...args) {
    if (emitter.events.size === 0 || !emitter.events.has(event)) {
      return false;
    }
    const listeners = emitter.events.get(event);
    const handlers = [...listeners];
    for (const ee of handlers) {
      ee.callback.apply(ee.context, args);
      if (ee.once) {
        listeners.delete(ee);
      }
    }
    if (listeners.size === 0) {
      emitter.events.delete(event);
    }
    return true;
  }

  // ../phaser-genesis/src/input/keyboard/Key.ts
  var Key = class {
    value;
    events;
    capture = true;
    isDown = false;
    enabled = true;
    repeatRate = 0;
    canRepeat = true;
    timeDown = 0;
    timeUpdated = 0;
    timeUp = 0;
    shiftKey;
    ctrlKey;
    altKey;
    downCallback;
    upCallback;
    constructor(value) {
      this.value = value;
      this.events = new Map();
    }
    getValue() {
      return this.value;
    }
    down(event) {
      if (!this.enabled) {
        return;
      }
      if (this.capture) {
        event.preventDefault();
      }
      this.shiftKey = event.shiftKey;
      this.ctrlKey = event.ctrlKey;
      this.altKey = event.altKey;
      if (this.isDown && this.canRepeat) {
        this.timeUpdated = event.timeStamp;
        const delay = this.timeUpdated - this.timeDown;
        if (delay >= this.repeatRate) {
          Emit(this, "keydown", this);
          if (this.downCallback) {
            this.downCallback(this);
          }
        }
      } else {
        this.isDown = true;
        this.timeDown = event.timeStamp;
        this.timeUpdated = event.timeStamp;
        Emit(this, "keydown", this);
        if (this.downCallback) {
          this.downCallback(this);
        }
      }
    }
    up(event) {
      if (!this.enabled) {
        return;
      }
      if (this.capture) {
        event.preventDefault();
      }
      this.shiftKey = event.shiftKey;
      this.ctrlKey = event.ctrlKey;
      this.altKey = event.altKey;
      if (this.isDown) {
        this.isDown = false;
        this.timeUp = event.timeStamp;
        this.timeUpdated = event.timeStamp;
        Emit(this, "keyup", this);
        if (this.upCallback) {
          this.upCallback(this);
        }
      }
    }
    reset() {
      this.isDown = false;
      this.timeUpdated = this.timeDown;
      this.timeUp = this.timeDown;
    }
    destroy() {
      this.downCallback = null;
      this.upCallback = null;
      this.events.clear();
    }
  };

  // ../phaser-genesis/src/input/keyboard/keys/DownKey.ts
  var DownKey = class extends Key {
    constructor() {
      super("ArrowDown");
    }
  };

  // ../phaser-genesis/src/input/keyboard/keys/LeftKey.ts
  var LeftKey = class extends Key {
    constructor() {
      super("ArrowLeft");
    }
  };

  // ../phaser-genesis/src/input/keyboard/keys/RightKey.ts
  var RightKey = class extends Key {
    constructor() {
      super("ArrowRight");
    }
  };

  // ../phaser-genesis/src/input/keyboard/keys/UpKey.ts
  var UpKey = class extends Key {
    constructor() {
      super("ArrowUp");
    }
  };

  // ../phaser-genesis/src/textures/SetFramePivot.ts
  function SetFramePivot(frame2, x, y) {
    frame2.pivot = { x, y };
    return frame2;
  }

  // ../phaser-genesis/src/textures/SetFrameSourceSize.ts
  function SetFrameSourceSize(frame2, width, height) {
    frame2.sourceSizeWidth = width;
    frame2.sourceSizeHeight = height;
    return frame2;
  }

  // ../phaser-genesis/src/textures/SetFrameTrim.ts
  function SetFrameTrim(frame2, width, height, x, y, w, h) {
    frame2.trimmed = true;
    frame2.sourceSizeWidth = width;
    frame2.sourceSizeHeight = height;
    frame2.spriteSourceSizeX = x;
    frame2.spriteSourceSizeY = y;
    frame2.spriteSourceSizeWidth = w;
    frame2.spriteSourceSizeHeight = h;
    return frame2;
  }

  // ../phaser-genesis/src/textures/parsers/AtlasParser.ts
  function AtlasParser(texture, data) {
    let frames;
    if (Array.isArray(data.textures)) {
      frames = data.textures[0].frames;
    } else if (Array.isArray(data.frames)) {
      frames = data.frames;
    } else if (data.hasOwnProperty("frames")) {
      frames = [];
      for (const [filename, frame2] of Object.entries(data.frames)) {
        frame2["filename"] = filename;
        frames.push(frame2);
      }
    } else {
      console.warn("Invalid Texture Atlas JSON");
    }
    if (frames) {
      let newFrame;
      for (let i = 0; i < frames.length; i++) {
        const src = frames[i];
        newFrame = texture.addFrame(src.filename, src.frame.x, src.frame.y, src.frame.w, src.frame.h);
        if (src.trimmed) {
          SetFrameTrim(newFrame, src.sourceSize.w, src.sourceSize.h, src.spriteSourceSize.x, src.spriteSourceSize.y, src.spriteSourceSize.w, src.spriteSourceSize.h);
        } else {
          SetFrameSourceSize(newFrame, src.sourceSize.w, src.sourceSize.h);
        }
        if (src.rotated) {
        }
        if (src.anchor) {
          SetFramePivot(newFrame, src.anchor.x, src.anchor.y);
        }
      }
    }
  }

  // ../phaser-genesis/src/textures/CreateCanvas.ts
  function CreateCanvas(width, height) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas.getContext("2d");
  }

  // ../phaser-genesis/src/textures/types/CanvasTexture.ts
  function CanvasTexture(width = 32, height = 32) {
    const ctx = CreateCanvas(width, height);
    return new Texture(ctx.canvas);
  }

  // ../phaser-genesis/src/textures/TextureManagerInstance.ts
  var instance5;
  var TextureManagerInstance = {
    get: () => {
      return instance5;
    },
    set: (manager) => {
      if (instance5) {
        throw new Error("Cannot instantiate TextureManager more than once");
      }
      instance5 = manager;
    }
  };

  // ../phaser-genesis/src/textures/TextureManager.ts
  var TextureManager = class {
    textures;
    constructor() {
      TextureManagerInstance.set(this);
      this.textures = new Map();
      this.createDefaultTextures();
    }
    createDefaultTextures() {
      this.add("__BLANK", new Texture(CreateCanvas(2, 2).canvas));
      const missing = CreateCanvas(32, 32);
      missing.strokeStyle = "#0f0";
      missing.moveTo(0, 0);
      missing.lineTo(32, 32);
      missing.stroke();
      missing.strokeRect(0.5, 0.5, 31, 31);
      this.add("__MISSING", new Texture(missing.canvas));
      const white = CreateCanvas(2, 2);
      white.fillStyle = "#fff";
      white.fillRect(0, 0, 2, 2);
      const whiteTexture = this.add("__WHITE", new Texture(white.canvas));
      WhiteTexture.set(whiteTexture);
    }
    get(key) {
      const textures = this.textures;
      if (textures.has(key)) {
        return textures.get(key);
      } else {
        return textures.get("__MISSING");
      }
    }
    has(key) {
      return this.textures.has(key);
    }
    add(key, source, glConfig) {
      let texture;
      if (!this.textures.has(key)) {
        if (source instanceof Texture) {
          texture = source;
        } else {
          texture = new Texture(source, 0, 0, glConfig);
        }
        texture.key = key;
        this.textures.set(key, texture);
      }
      return texture;
    }
    update(key, source, glConfig) {
      const texture = this.textures.get(key);
      if (texture) {
        texture.update(source, glConfig);
      }
      return texture;
    }
  };

  // ../phaser-genesis/src/textures/CreateTextureManager.ts
  function CreateTextureManager() {
    new TextureManager();
  }

  // ../phaser-genesis/src/textures/GetTexture.ts
  function GetTexture(key) {
    return TextureManagerInstance.get().get(key);
  }

  // ../phaser-genesis/src/textures/GetFramesInRange.ts
  function GetFramesInRange(texture, config) {
    const {
      prefix = "",
      start = 0,
      zeroPad = 0,
      suffix = ""
    } = config;
    let end = config.end;
    const output = [];
    const diff2 = start < end ? 1 : -1;
    end += diff2;
    for (let i = start; i !== end; i += diff2) {
      const frameKey = prefix + i.toString().padStart(zeroPad, "0") + suffix;
      output.push(texture.getFrame(frameKey));
    }
    return output;
  }

  // ../phaser-genesis/src/components/color/ColorComponent.ts
  var ColorComponent = defineComponent({
    r: Types.ui8c,
    g: Types.ui8c,
    b: Types.ui8c,
    a: Types.f32,
    colorMatrix: [Types.f32, 16],
    colorOffset: [Types.f32, 4]
  });

  // ../phaser-genesis/src/components/color/AddColorComponent.ts
  function AddColorComponent(id) {
    addComponent(GameObjectWorld, ColorComponent, id);
    ColorComponent.r[id] = 255;
    ColorComponent.g[id] = 255;
    ColorComponent.b[id] = 255;
    ColorComponent.a[id] = 1;
    ColorComponent.colorMatrix[id].set(DEFAULT_COLOR_MATRIX);
  }

  // ../phaser-genesis/src/components/hierarchy/GetWorldID.ts
  function GetWorldID(id) {
    return HierarchyComponent.data[id][HIERARCHY.WORLD];
  }

  // ../phaser-genesis/src/components/dirty/SetDirtyColor.ts
  function SetDirtyColor(id) {
    DirtyComponent.data[id][DIRTY.COLOR] = 1;
    const world2 = GetWorldID(id);
    if (world2) {
      DirtyComponent.data[world2][DIRTY.CHILD_COLOR] = 1;
    }
  }

  // ../phaser-genesis/src/components/dirty/AddDirtyComponent.ts
  function AddDirtyComponent(id) {
    addComponent(GameObjectWorld, DirtyComponent, id);
    SetDirtyColor(id);
  }

  // ../phaser-genesis/src/components/dirty/ClearDirtyChildColor.ts
  function ClearDirtyChildColor(id) {
    DirtyComponent.data[id][DIRTY.CHILD_COLOR] = 0;
  }

  // ../phaser-genesis/src/components/dirty/ClearDirtyChildTransform.ts
  function ClearDirtyChildTransform(id) {
    DirtyComponent.data[id][DIRTY.CHILD_TRANSFORM] = 0;
  }

  // ../phaser-genesis/src/components/dirty/ClearDirtyColor.ts
  function ClearDirtyColor(id) {
    DirtyComponent.data[id][DIRTY.COLOR] = 0;
  }

  // ../phaser-genesis/src/components/dirty/ClearDirtyDisplayList.ts
  function ClearDirtyDisplayList(id) {
    DirtyComponent.data[id][DIRTY.DISPLAY_LIST] = 0;
  }

  // ../phaser-genesis/src/components/dirty/ClearDirtyWorldTransform.ts
  function ClearDirtyWorldTransform(id) {
    DirtyComponent.data[id][DIRTY.WORLD_TRANSFORM] = 0;
  }

  // ../phaser-genesis/src/components/dirty/HasDirtyChildCache.ts
  function HasDirtyChildCache(id) {
    return !!DirtyComponent.data[id][DIRTY.CHILD_CACHE];
  }

  // ../phaser-genesis/src/components/dirty/HasDirtyChildColor.ts
  function HasDirtyChildColor(id) {
    return !!DirtyComponent.data[id][DIRTY.CHILD_COLOR];
  }

  // ../phaser-genesis/src/components/dirty/HasDirtyChildTransform.ts
  function HasDirtyChildTransform(id) {
    return !!DirtyComponent.data[id][DIRTY.CHILD_TRANSFORM];
  }

  // ../phaser-genesis/src/components/dirty/HasDirtyColor.ts
  function HasDirtyColor(id) {
    return !!DirtyComponent.data[id][DIRTY.COLOR];
  }

  // ../phaser-genesis/src/components/dirty/HasDirtyDisplayList.ts
  function HasDirtyDisplayList(id) {
    return !!DirtyComponent.data[id][DIRTY.DISPLAY_LIST];
  }

  // ../phaser-genesis/src/components/dirty/HasDirtyWorldTransform.ts
  function HasDirtyWorldTransform(id) {
    return !!DirtyComponent.data[id][DIRTY.WORLD_TRANSFORM];
  }

  // ../phaser-genesis/src/components/dirty/SetDirtyChildColor.ts
  function SetDirtyChildColor(id) {
    DirtyComponent.data[id][DIRTY.CHILD_COLOR] = 1;
  }

  // ../phaser-genesis/src/components/dirty/SetDirtyDisplayList.ts
  function SetDirtyDisplayList(id) {
    DirtyComponent.data[id][DIRTY.DISPLAY_LIST] = 1;
  }

  // ../phaser-genesis/src/components/dirty/SetDirtyWorldTransform.ts
  function SetDirtyWorldTransform(id) {
    DirtyComponent.data[id][DIRTY.WORLD_TRANSFORM] = 1;
  }

  // ../phaser-genesis/src/components/dirty/WillUpdateTransform.ts
  function WillUpdateTransform(id) {
    const data = DirtyComponent.data[id];
    return !!(data[DIRTY.WORLD_TRANSFORM] || data[DIRTY.CHILD_TRANSFORM]);
  }

  // ../phaser-genesis/src/components/permissions/SetWillColorChildren.ts
  function SetWillColorChildren(id, value) {
    PermissionsComponent.data[id][PERMISSION.WILL_COLOR_CHILDREN] = Number(value);
  }

  // ../phaser-genesis/src/components/permissions/WillColorChildren.ts
  function WillColorChildren(id) {
    return !!PermissionsComponent.data[id][PERMISSION.WILL_COLOR_CHILDREN];
  }

  // ../phaser-genesis/src/components/color/Color.ts
  var Color = class {
    id;
    colorMatrixEnabled = false;
    constructor(id, red = 255, green = 255, blue = 255, alpha = 1) {
      AddColorComponent(id);
      this.id = id;
      this.set(red, green, blue, alpha);
    }
    set(red, green, blue, alpha) {
      this.red = red;
      this.green = green;
      this.blue = blue;
      this.alpha = alpha;
    }
    set tint(value) {
      this.red = value >> 16 & 255;
      this.green = value >> 8 & 255;
      this.blue = value & 255;
    }
    get tint() {
      return this.red << 16 | this.green << 8 | this.blue;
    }
    set willColorChildren(value) {
      SetWillColorChildren(this.id, value);
    }
    get willColorChildren() {
      return WillColorChildren(this.id);
    }
    set colorMatrix(value) {
      ColorComponent.colorMatrix[this.id].set(value);
      SetDirtyColor(this.id);
      this.colorMatrixEnabled = true;
    }
    get colorMatrix() {
      return ColorComponent.colorMatrix[this.id];
    }
    set colorOffset(value) {
      ColorComponent.colorOffset[this.id].set(value);
      SetDirtyColor(this.id);
    }
    get colorOffset() {
      return ColorComponent.colorOffset[this.id];
    }
    set red(value) {
      ColorComponent.r[this.id] = value;
      SetDirtyColor(this.id);
    }
    get red() {
      return ColorComponent.r[this.id];
    }
    set green(value) {
      ColorComponent.g[this.id] = value;
      SetDirtyColor(this.id);
    }
    get green() {
      return ColorComponent.g[this.id];
    }
    set blue(value) {
      ColorComponent.b[this.id] = value;
      SetDirtyColor(this.id);
    }
    get blue() {
      return ColorComponent.b[this.id];
    }
    set alpha(value) {
      ColorComponent.a[this.id] = value;
      SetDirtyColor(this.id);
    }
    get alpha() {
      return ColorComponent.a[this.id];
    }
  };

  // ../phaser-genesis/src/components/hierarchy/GetNextSiblingID.ts
  function GetNextSiblingID(id) {
    return HierarchyComponent.data[id][HIERARCHY.NEXT];
  }

  // ../phaser-genesis/src/components/hierarchy/SetNextSiblingID.ts
  function SetNextSiblingID(parentID, childID) {
    HierarchyComponent.data[parentID][HIERARCHY.NEXT] = childID;
  }

  // ../phaser-genesis/src/components/hierarchy/SetPreviousSiblingID.ts
  function SetPreviousSiblingID(parentID, childID) {
    HierarchyComponent.data[parentID][HIERARCHY.PREV] = childID;
  }

  // ../phaser-genesis/src/components/hierarchy/LinkSiblings.ts
  function LinkSiblings(childA, childB) {
    SetNextSiblingID(childA, childB);
    SetPreviousSiblingID(childB, childA);
  }

  // ../phaser-genesis/src/components/hierarchy/SetLastChildID.ts
  function SetLastChildID(parentID, childID) {
    HierarchyComponent.data[parentID][HIERARCHY.LAST] = childID;
  }

  // ../phaser-genesis/src/components/hierarchy/GetPreviousSiblingID.ts
  function GetPreviousSiblingID(id) {
    return HierarchyComponent.data[id][HIERARCHY.PREV];
  }

  // ../phaser-genesis/src/components/hierarchy/SetFirstChildID.ts
  function SetFirstChildID(parentID, childID) {
    HierarchyComponent.data[parentID][HIERARCHY.FIRST] = childID;
  }

  // ../phaser-genesis/src/components/hierarchy/AddHierarchyComponent.ts
  function AddHierarchyComponent(id) {
    addComponent(GameObjectWorld, HierarchyComponent, id);
  }

  // ../phaser-genesis/src/components/hierarchy/GetFirstChildID.ts
  function GetFirstChildID(parentID) {
    return HierarchyComponent.data[parentID][HIERARCHY.FIRST];
  }

  // ../phaser-genesis/src/components/hierarchy/ClearSiblings.ts
  function ClearSiblings(id) {
    SetNextSiblingID(id, 0);
    SetPreviousSiblingID(id, 0);
  }

  // ../phaser-genesis/src/components/hierarchy/DecreaseNumChildren.ts
  function DecreaseNumChildren(parentID, total2 = 1) {
    const data = HierarchyComponent.data[parentID];
    data[HIERARCHY.NUM_CHILDREN] = Math.max(0, data[HIERARCHY.NUM_CHILDREN] - total2);
  }

  // ../phaser-genesis/src/gameobjects/GameObjectCache.ts
  var GameObjectCache = {
    local: [],
    set: function(index, object) {
      this.local[index] = object;
    },
    get: function(index) {
      return this.local[index];
    },
    clear: function() {
      this.local.length = 0;
    },
    remove: function(index) {
      this.local[index] = null;
    }
  };

  // ../phaser-genesis/src/components/hierarchy/ClearWorldAndParentID.ts
  function ClearWorldAndParentID(id) {
    const worldID = GetWorldID(id);
    const parentID = GetParentID(id);
    const world2 = GameObjectCache.get(worldID);
    HierarchyComponent.data[id][HIERARCHY.WORLD] = 0;
    HierarchyComponent.data[id][HIERARCHY.PARENT] = 0;
    if (world2 && hasComponent(GameObjectWorld, world2.tag, id)) {
      removeComponent(GameObjectWorld, world2.tag, id);
    }
    DecreaseNumChildren(parentID);
    SetDirtyParents(id);
  }

  // ../phaser-genesis/src/components/hierarchy/MoveNext.ts
  function MoveNext(id, rootID) {
    const firstChild = GetFirstChildID(id);
    if (firstChild > 0) {
      return firstChild;
    } else {
      const sibling = GetNextSiblingID(id);
      if (sibling === 0) {
        const parent = GetParentID(id);
        if (parent === rootID) {
          return 0;
        } else {
          return GetNextSiblingID(parent);
        }
      } else {
        return sibling;
      }
    }
  }

  // ../phaser-genesis/src/components/hierarchy/DepthFirstSearchFromParentID.ts
  function DepthFirstSearchFromParentID(parentID, removeParent = true) {
    const output = [parentID];
    let next = GetFirstChildID(parentID);
    while (next > 0) {
      output.push(next);
      next = MoveNext(next, parentID);
    }
    if (removeParent) {
      output.shift();
    }
    return output;
  }

  // ../phaser-genesis/src/components/hierarchy/GetChildIDsFromParent.ts
  function GetChildIDsFromParent(parent) {
    let next = GetFirstChildID(parent.id);
    const output = [];
    while (next > 0) {
      output.push(next);
      next = GetNextSiblingID(next);
    }
    return output;
  }

  // ../phaser-genesis/src/components/hierarchy/GetChildrenFromParentID.ts
  function GetChildrenFromParentID(id) {
    const out = [];
    let next = GetFirstChildID(id);
    while (next > 0) {
      out.push(GameObjectCache.get(next));
      next = GetNextSiblingID(next);
    }
    return out;
  }

  // ../phaser-genesis/src/components/hierarchy/GetLastChildID.ts
  function GetLastChildID(parentID) {
    return HierarchyComponent.data[parentID][HIERARCHY.LAST];
  }

  // ../phaser-genesis/src/components/hierarchy/GetNumChildren.ts
  function GetNumChildren(id) {
    return HierarchyComponent.data[id][HIERARCHY.NUM_CHILDREN];
  }

  // ../phaser-genesis/src/components/hierarchy/GetParentGameObject.ts
  function GetParentGameObject(id) {
    return GameObjectCache.get(HierarchyComponent.data[id][HIERARCHY.PARENT]);
  }

  // ../phaser-genesis/src/components/hierarchy/GetWorldFromID.ts
  function GetWorldFromID(childID) {
    const worldID = GetWorldID(childID);
    if (worldID) {
      return GameObjectCache.get(worldID);
    }
  }

  // ../phaser-genesis/src/components/hierarchy/GetWorldFromParentID.ts
  function GetWorldFromParentID(parentID) {
    const worldID = GetWorldID(parentID);
    return GameObjectCache.get(worldID);
  }

  // ../phaser-genesis/src/components/hierarchy/HasChildren.ts
  function HasChildren(id) {
    return !!(HierarchyComponent.data[id][HIERARCHY.NUM_CHILDREN] > 0);
  }

  // ../phaser-genesis/src/components/permissions/GetVisibleChildren.ts
  function GetVisibleChildren(id) {
    return Boolean(PermissionsComponent.data[id][PERMISSION.VISIBLE_CHILDREN]);
  }

  // ../phaser-genesis/src/components/permissions/WillRenderChildren.ts
  function WillRenderChildren(id) {
    return GetVisibleChildren(id) && !!PermissionsComponent.data[id][PERMISSION.WILL_RENDER_CHILDREN];
  }

  // ../phaser-genesis/src/components/permissions/WillUpdateChildren.ts
  function WillUpdateChildren(id) {
    return !!PermissionsComponent.data[id][PERMISSION.WILL_UPDATE_CHILDREN];
  }

  // ../phaser-genesis/src/components/hierarchy/MoveNextUpdatable.ts
  function MoveNextUpdatable(id) {
    const firstChild = GetFirstChildID(id);
    if (firstChild > 0 && WillUpdateChildren(id)) {
      return firstChild;
    } else {
      const sibling = GetNextSiblingID(id);
      if (sibling === 0) {
        const parent = GetParentID(id);
        if (parent === GetWorldID(id)) {
          return 0;
        } else {
          return GetNextSiblingID(parent);
        }
      } else {
        return sibling;
      }
    }
  }

  // ../phaser-genesis/src/components/hierarchy/SetNumChildren.ts
  function SetNumChildren(parentID, total2) {
    HierarchyComponent.data[parentID][HIERARCHY.NUM_CHILDREN] = total2;
  }

  // ../phaser-genesis/src/components/hierarchy/RelinkChildren.ts
  function RelinkChildren(parentID, children) {
    const len = children.length;
    if (len === 0) {
      SetNumChildren(parentID, 0);
      SetFirstChildID(parentID, 0);
      SetLastChildID(parentID, 0);
      return;
    }
    let total2 = 1;
    let childA = children[0];
    SetFirstChildID(parentID, childA);
    if (len === 1) {
      SetLastChildID(parentID, childA);
      SetNumChildren(parentID, total2);
      return;
    }
    for (let i = 1; i < len; i++) {
      const childB = children[i];
      LinkSiblings(childA, childB);
      childA = childB;
      total2++;
    }
    SetLastChildID(parentID, childA);
    SetNumChildren(parentID, total2);
  }

  // ../phaser-genesis/src/components/hierarchy/RemoveChildID.ts
  function RemoveChildID(childID) {
    const parentID = GetParentID(childID);
    const first = GetFirstChildID(parentID);
    const last = GetLastChildID(parentID);
    const prevID = GetPreviousSiblingID(childID);
    const nextID = GetNextSiblingID(childID);
    LinkSiblings(prevID, nextID);
    if (first === childID) {
      SetFirstChildID(parentID, nextID);
    }
    if (last === childID) {
      SetLastChildID(parentID, prevID);
    }
    ClearSiblings(childID);
  }

  // ../phaser-genesis/src/components/hierarchy/SetWorldID.ts
  function SetWorldID(id, worldID) {
    HierarchyComponent.data[id][HIERARCHY.WORLD] = worldID;
  }

  // ../phaser-genesis/src/components/hierarchy/RemoveWorldTag.ts
  function RemoveWorldTag(id) {
    const world2 = GetWorldFromParentID(id);
    const children = DepthFirstSearchFromParentID(id, false);
    children.map((childID) => {
      removeComponent(GameObjectWorld, world2.tag, childID);
      SetWorldID(childID, 0);
    });
  }

  // ../phaser-genesis/src/components/hierarchy/SetParentID.ts
  function SetParentID(childID, parentID) {
    HierarchyComponent.data[childID][HIERARCHY.PARENT] = parentID;
  }

  // ../phaser-genesis/src/components/hierarchy/RemoveChildIDFromCurrentParent.ts
  function RemoveChildIDFromCurrentParent(childID, newParentID) {
    const parentID = GetParentID(childID);
    if (parentID) {
      const firstID = GetFirstChildID(parentID);
      const lastID = GetLastChildID(parentID);
      const nextID = GetNextSiblingID(childID);
      const prevID = GetPreviousSiblingID(childID);
      if (childID === firstID) {
        SetFirstChildID(parentID, nextID);
      }
      if (childID === lastID) {
        SetLastChildID(parentID, prevID);
      }
      if (nextID) {
        SetPreviousSiblingID(nextID, prevID);
      }
      if (prevID) {
        SetNextSiblingID(prevID, nextID);
      }
      SetDirtyParents(childID);
      SetParentID(childID, 0);
      SetNumChildren(parentID, GetNumChildren(parentID) - 1);
    }
    const oldWorld = GetWorldFromID(childID);
    const newWorld = newParentID ? GetWorldFromID(newParentID) : null;
    if (oldWorld && oldWorld !== newWorld) {
      RemoveWorldTag(childID);
    }
  }

  // ../phaser-genesis/src/components/permissions/WillTransformChildren.ts
  function WillTransformChildren(id) {
    return !!PermissionsComponent.data[id][PERMISSION.WILL_TRANSFORM_CHILDREN];
  }

  // ../phaser-genesis/src/components/transform/SetRootTransform.ts
  function SetRootTransform(id) {
    const worldID = GetWorldID(id);
    let currentParent = GetParentID(id);
    let isRootTransform = true;
    while (currentParent && currentParent !== worldID) {
      if (WillTransformChildren(currentParent)) {
        isRootTransform = false;
        break;
      }
      currentParent = GetParentID(currentParent);
    }
    Transform2DComponent.data[id][TRANSFORM.IS_ROOT] = Number(isRootTransform);
  }

  // ../phaser-genesis/src/components/hierarchy/SetWorldTag.ts
  function SetWorldTag(world2, id) {
    const worldID = world2.id;
    const worldTag = world2.tag;
    const children = DepthFirstSearchFromParentID(id, false);
    children.map((childID) => {
      addComponent(GameObjectWorld, worldTag, childID);
      SetWorldID(childID, worldID);
    });
    world2.updateDisplayList = true;
  }

  // ../phaser-genesis/src/components/hierarchy/SetAndUpdateParent.ts
  function SetAndUpdateParent(parentID, childID, addChildren = 1) {
    SetParentID(childID, parentID);
    SetDirtyTransform(childID);
    SetDirtyParents(childID);
    SetRootTransform(childID);
    SetNumChildren(parentID, GetNumChildren(parentID) + addChildren);
    if (WillCacheChildren(parentID)) {
      SetDirtyChildCache(parentID);
    }
    const world2 = GetWorldFromParentID(parentID);
    if (world2) {
      SetWorldTag(world2, childID);
    }
  }

  // ../phaser-genesis/src/components/permissions/AddPermissionsComponent.ts
  function AddPermissionsComponent(id) {
    addComponent(GameObjectWorld, PermissionsComponent, id);
    PermissionsComponent.data[id].set([1, 1, 1, 1, 1, 1, 0, 1, 1, 0]);
  }

  // ../phaser-genesis/src/components/permissions/GetVisible.ts
  function GetVisible(id) {
    return Boolean(PermissionsComponent.data[id][PERMISSION.VISIBLE]);
  }

  // ../phaser-genesis/src/components/permissions/HasCustomDisplayList.ts
  function HasCustomDisplayList(id) {
    return !!PermissionsComponent.data[id][PERMISSION.CUSTOM_DISPLAY_LIST];
  }

  // ../phaser-genesis/src/components/permissions/HasRenderableChildren.ts
  function HasRenderableChildren(id, dirtyCamera) {
    const numChildren = GetNumChildren(id);
    if (numChildren === 0 || !WillRenderChildren(id)) {
      return 0;
    }
    if (dirtyCamera || !WillCacheChildren(id) || WillCacheChildren(id) && HasDirtyChildCache(id)) {
      return numChildren;
    }
    return 0;
  }

  // ../phaser-genesis/src/components/permissions/SetCustomDisplayList.ts
  function SetCustomDisplayList(id, value) {
    PermissionsComponent.data[id][PERMISSION.CUSTOM_DISPLAY_LIST] = Number(value);
  }

  // ../phaser-genesis/src/components/permissions/SetVisible.ts
  function SetVisible(id, value) {
    PermissionsComponent.data[id][PERMISSION.VISIBLE] = Number(value);
    SetDirtyParents(id);
  }

  // ../phaser-genesis/src/components/permissions/SetVisibleChildren.ts
  function SetVisibleChildren(id, value) {
    PermissionsComponent.data[id][PERMISSION.VISIBLE_CHILDREN] = Number(value);
    SetDirtyParents(id);
  }

  // ../phaser-genesis/src/components/permissions/SetWillCacheChildren.ts
  function SetWillCacheChildren(id, value) {
    PermissionsComponent.data[id][PERMISSION.WILL_CACHE_CHILDREN] = Number(value);
  }

  // ../phaser-genesis/src/components/permissions/SetWillTransformChildren.ts
  function SetWillTransformChildren(id, value) {
    PermissionsComponent.data[id][PERMISSION.WILL_TRANSFORM_CHILDREN] = Number(value);
  }

  // ../phaser-genesis/src/components/permissions/SetWillUpdateChildren.ts
  function SetWillUpdateChildren(id, value) {
    PermissionsComponent.data[id][PERMISSION.WILL_UPDATE_CHILDREN] = Number(value);
  }

  // ../phaser-genesis/src/components/permissions/WillRender.ts
  function WillRender(id) {
    return !!PermissionsComponent.data[id][PERMISSION.VISIBLE] && !!PermissionsComponent.data[id][PERMISSION.WILL_RENDER];
  }

  // ../phaser-genesis/src/components/permissions/WillUpdate.ts
  function WillUpdate(id) {
    return !!PermissionsComponent.data[id][PERMISSION.WILL_UPDATE];
  }

  // ../phaser-genesis/src/components/transform/GetLocalBounds.ts
  function GetLocalBounds(id) {
    const data = Transform2DComponent.data[id];
    const left = data[TRANSFORM.BOUNDS_X1];
    const top = data[TRANSFORM.BOUNDS_Y1];
    const right = data[TRANSFORM.BOUNDS_X2];
    const bottom = data[TRANSFORM.BOUNDS_Y2];
    return { left, top, right, bottom };
  }

  // ../phaser-genesis/src/math/vec2/Vec2FromArray.ts
  function Vec2FromArray(dst, src = [], index = 0) {
    return dst.set(src[index], src[index + 1]);
  }

  // ../phaser-genesis/src/math/vec2/Vec2ToArray.ts
  function Vec2ToArray(v, dst = [], index = 0) {
    dst[index] = v.x;
    dst[index + 1] = v.y;
    return dst;
  }

  // ../phaser-genesis/src/math/vec2/Vec2.ts
  var Vec2 = class {
    x;
    y;
    constructor(x = 0, y = 0) {
      this.set(x, y);
    }
    set(x = 0, y = 0) {
      this.x = x;
      this.y = y;
      return this;
    }
    toArray(dst = [], index = 0) {
      return Vec2ToArray(this, dst, index);
    }
    fromArray(src, index = 0) {
      Vec2FromArray(this, src, index);
      return this;
    }
    toString() {
      return `{ x=${this.x}, y=${this.y} }`;
    }
  };

  // ../phaser-genesis/src/components/transform/IsInView.ts
  function IsInView(id) {
    return !!Transform2DComponent.data[id][TRANSFORM.IN_VIEW];
  }

  // ../phaser-genesis/src/components/transform/Origin.ts
  var Origin = class {
    id;
    _x;
    _y;
    _data;
    constructor(id, x = 0, y = 0) {
      this.id = id;
      this._data = Transform2DComponent.data[id];
      this.set(x, y);
    }
    set(x, y = x) {
      const data = this._data;
      this._x = x;
      this._y = y;
      data[TRANSFORM.ORIGIN_X] = x;
      data[TRANSFORM.ORIGIN_Y] = y;
      UpdateExtent(this.id, data[TRANSFORM.FRAME_WIDTH], data[TRANSFORM.FRAME_HEIGHT]);
      return this;
    }
    set x(value) {
      const data = this._data;
      this._x = value;
      data[TRANSFORM.ORIGIN_X] = value;
      UpdateExtent(this.id, data[TRANSFORM.FRAME_WIDTH], data[TRANSFORM.FRAME_HEIGHT]);
    }
    get x() {
      return this._x;
    }
    set y(value) {
      const data = this._data;
      this._y = value;
      data[TRANSFORM.ORIGIN_Y] = value;
      UpdateExtent(this.id, data[TRANSFORM.FRAME_WIDTH], data[TRANSFORM.FRAME_HEIGHT]);
    }
    get y() {
      return this._y;
    }
    destroy() {
      this._data = null;
    }
  };

  // ../phaser-genesis/src/components/transform/Position.ts
  var Position = class {
    id;
    _x;
    _y;
    _data;
    constructor(id, x = 0, y = 0) {
      this.id = id;
      this._data = Transform2DComponent.data[id];
      this.set(x, y);
    }
    set(x, y = x) {
      this.x = x;
      this.y = y;
      return this;
    }
    set x(value) {
      this._x = value;
      this._data[TRANSFORM.X] = value;
      SetDirtyTransform(this.id);
    }
    get x() {
      return this._x;
    }
    set y(value) {
      this._y = value;
      this._data[TRANSFORM.Y] = value;
      SetDirtyTransform(this.id);
    }
    get y() {
      return this._y;
    }
    destroy() {
      this._data = null;
    }
  };

  // ../phaser-genesis/src/components/transform/Scale.ts
  var Scale = class {
    id;
    _x;
    _y;
    _data;
    constructor(id, x = 1, y = 1) {
      this.id = id;
      this._data = Transform2DComponent.data[id];
      this.set(x, y);
    }
    set(x, y = x) {
      this.x = x;
      this.y = y;
      return this;
    }
    set x(value) {
      this._x = value;
      this._data[TRANSFORM.SCALE_X] = value;
      SetDirtyTransform(this.id);
    }
    get x() {
      return this._x;
    }
    set y(value) {
      this._y = value;
      this._data[TRANSFORM.SCALE_Y] = value;
      SetDirtyTransform(this.id);
    }
    get y() {
      return this._y;
    }
    destroy() {
      this._data = null;
    }
  };

  // ../phaser-genesis/src/components/transform/SetExtent.ts
  function SetExtent(id, x, y, width, height) {
    const data = Transform2DComponent.data[id];
    data[TRANSFORM.FRAME_X1] = x;
    data[TRANSFORM.FRAME_Y1] = y;
    data[TRANSFORM.FRAME_X2] = x + width;
    data[TRANSFORM.FRAME_Y2] = y + height;
    data[TRANSFORM.FRAME_WIDTH] = width;
    data[TRANSFORM.FRAME_HEIGHT] = height;
    SetDirtyTransform(id);
  }

  // ../phaser-genesis/src/components/transform/SetInViewFromBounds.ts
  function SetInViewFromBounds(id, cx, cy, cright, cbottom) {
    const data = Transform2DComponent.data[id];
    const bx = data[TRANSFORM.BOUNDS_X1];
    const by = data[TRANSFORM.BOUNDS_Y1];
    const br = data[TRANSFORM.BOUNDS_X2];
    const bb = data[TRANSFORM.BOUNDS_Y2];
    data[TRANSFORM.IN_VIEW] = Number(!(cright < bx || cbottom < by || cx > br || cy > bb));
  }

  // ../phaser-genesis/src/components/transform/UpdateAxisAligned.ts
  function UpdateAxisAligned(id) {
    const data = Transform2DComponent.data[id];
    const rotation = data[TRANSFORM.ROTATION];
    const skewX = data[TRANSFORM.SKEW_X];
    const skewY = data[TRANSFORM.SKEW_Y];
    data[TRANSFORM.AXIS_ALIGNED] = Number(rotation === 0 && skewX === 0 && skewY === 0);
  }

  // ../phaser-genesis/src/components/transform/Skew.ts
  var Skew = class {
    id;
    _x;
    _y;
    _data;
    constructor(id, x = 0, y = 0) {
      this.id = id;
      this._data = Transform2DComponent.data[id];
      this.set(x, y);
    }
    set(x, y = x) {
      this.x = x;
      this.y = y;
      return this;
    }
    set x(value) {
      this._x = value;
      this._data[TRANSFORM.SKEW_X] = value;
      const id = this.id;
      UpdateAxisAligned(id);
      SetDirtyTransform(id);
    }
    get x() {
      return this._x;
    }
    set y(value) {
      this._y = value;
      this._data[TRANSFORM.SKEW_Y] = value;
      const id = this.id;
      UpdateAxisAligned(id);
      SetDirtyTransform(id);
    }
    get y() {
      return this._y;
    }
    destroy() {
      this._data = null;
    }
  };

  // ../phaser-genesis/src/components/vertices/QuadVertexComponent.ts
  var QuadVertexComponent = defineComponent({
    values: [Types.f32, 54]
  });

  // ../phaser-genesis/src/components/vertices/SetQuadPosition.ts
  function SetQuadPosition(id, x0, y0, x1, y1, x2, y2, x3, y3) {
    const data = QuadVertexComponent.values[id];
    data[0] = x0;
    data[1] = y0;
    data[9] = x1;
    data[10] = y1;
    data[18] = x2;
    data[19] = y2;
    data[27] = x0;
    data[28] = y0;
    data[36] = x2;
    data[37] = y2;
    data[45] = x3;
    data[46] = y3;
  }

  // ../phaser-genesis/src/components/transform/UpdateTransforms.ts
  function UpdateTransforms(id, cx, cy, cright, cbottom, forceUpdate, parentIsDisplayList) {
    const data = Transform2DComponent.data[id];
    let tx = data[TRANSFORM.X];
    let ty = data[TRANSFORM.Y];
    const rotation = data[TRANSFORM.ROTATION];
    const scaleX = data[TRANSFORM.SCALE_X];
    const scaleY = data[TRANSFORM.SCALE_Y];
    const skewX = data[TRANSFORM.SKEW_X];
    const skewY = data[TRANSFORM.SKEW_Y];
    let axisAligned = Boolean(data[TRANSFORM.AXIS_ALIGNED]);
    let a = scaleX;
    let b = 0;
    let c = 0;
    let d = scaleY;
    if (!axisAligned) {
      a = Math.cos(rotation + skewY) * scaleX;
      b = Math.sin(rotation + skewY) * scaleX;
      c = -Math.sin(rotation - skewX) * scaleY;
      d = Math.cos(rotation - skewX) * scaleY;
    }
    data[TRANSFORM.LOCAL_A] = a;
    data[TRANSFORM.LOCAL_B] = b;
    data[TRANSFORM.LOCAL_C] = c;
    data[TRANSFORM.LOCAL_D] = d;
    data[TRANSFORM.LOCAL_TX] = tx;
    data[TRANSFORM.LOCAL_TY] = ty;
    if (data[TRANSFORM.IS_ROOT]) {
      data[TRANSFORM.WORLD_A] = a;
      data[TRANSFORM.WORLD_B] = b;
      data[TRANSFORM.WORLD_C] = c;
      data[TRANSFORM.WORLD_D] = d;
      data[TRANSFORM.WORLD_TX] = tx;
      data[TRANSFORM.WORLD_TY] = ty;
    } else {
      const parentID = GetParentID(id);
      const parentData = Transform2DComponent.data[parentID];
      const pa = parentData[TRANSFORM.WORLD_A];
      const pb = parentData[TRANSFORM.WORLD_B];
      const pc = parentData[TRANSFORM.WORLD_C];
      const pd = parentData[TRANSFORM.WORLD_D];
      const ptx = parentData[TRANSFORM.WORLD_TX];
      const pty = parentData[TRANSFORM.WORLD_TY];
      data[TRANSFORM.WORLD_A] = a * pa + b * pc;
      data[TRANSFORM.WORLD_B] = a * pb + b * pd;
      data[TRANSFORM.WORLD_C] = c * pa + d * pc;
      data[TRANSFORM.WORLD_D] = c * pb + d * pd;
      data[TRANSFORM.WORLD_TX] = tx * pa + ty * pc + ptx;
      data[TRANSFORM.WORLD_TY] = tx * pb + ty * pd + pty;
      a = data[TRANSFORM.WORLD_A];
      b = data[TRANSFORM.WORLD_B];
      c = data[TRANSFORM.WORLD_C];
      d = data[TRANSFORM.WORLD_D];
      tx = data[TRANSFORM.WORLD_TX];
      ty = data[TRANSFORM.WORLD_TY];
      axisAligned = false;
    }
    const x = data[TRANSFORM.FRAME_X1];
    const y = data[TRANSFORM.FRAME_Y1];
    const right = data[TRANSFORM.FRAME_X2];
    const bottom = data[TRANSFORM.FRAME_Y2];
    let x0 = x * a + tx;
    let y0 = y * d + ty;
    let x1 = x * a + tx;
    let y1 = bottom * d + ty;
    let x2 = right * a + tx;
    let y2 = bottom * d + ty;
    let x3 = right * a + tx;
    let y3 = y * d + ty;
    let inView = 0;
    if (axisAligned) {
      data[TRANSFORM.BOUNDS_X1] = x0;
      data[TRANSFORM.BOUNDS_Y1] = y0;
      data[TRANSFORM.BOUNDS_X2] = x2;
      data[TRANSFORM.BOUNDS_Y2] = y2;
      inView = Number(!(cright < x0 || cbottom < y0 || cx > x2 || cy > y2));
    } else {
      x0 += y * c;
      y0 += x * b;
      x1 += bottom * c;
      y1 += x * b;
      x2 += bottom * c;
      y2 += right * b;
      x3 += y * c;
      y3 += right * b;
      const bx = Math.min(x0, x1, x2, x3);
      const by = Math.min(y0, y1, y2, y3);
      const br = Math.max(x0, x1, x2, x3);
      const bb = Math.max(y0, y1, y2, y3);
      data[TRANSFORM.BOUNDS_X1] = bx;
      data[TRANSFORM.BOUNDS_Y1] = by;
      data[TRANSFORM.BOUNDS_X2] = br;
      data[TRANSFORM.BOUNDS_Y2] = bb;
      inView = Number(!(cright < bx || cbottom < by || cx > br || cy > bb));
    }
    data[TRANSFORM.IN_VIEW] = inView;
    if (inView === 1 || forceUpdate || parentIsDisplayList) {
      SetQuadPosition(id, x0, y0, x1, y1, x2, y2, x3, y3);
    }
    ClearDirtyTransform(id);
    if (WillTransformChildren(id)) {
      SetDirtyWorldTransform(id);
    }
  }

  // ../phaser-genesis/src/components/transform/UpdateWorldTransform.ts
  function UpdateWorldTransform(id, parentID, cx, cy, cright, cbottom, forceUpdate, parentIsDisplayList) {
    const parentData = Transform2DComponent.data[parentID];
    const data = Transform2DComponent.data[id];
    const pa = parentData[TRANSFORM.WORLD_A];
    const pb = parentData[TRANSFORM.WORLD_B];
    const pc = parentData[TRANSFORM.WORLD_C];
    const pd = parentData[TRANSFORM.WORLD_D];
    const ptx = parentData[TRANSFORM.WORLD_TX];
    const pty = parentData[TRANSFORM.WORLD_TY];
    let a = data[TRANSFORM.LOCAL_A];
    let b = data[TRANSFORM.LOCAL_B];
    let c = data[TRANSFORM.LOCAL_C];
    let d = data[TRANSFORM.LOCAL_D];
    let tx = data[TRANSFORM.LOCAL_TX];
    let ty = data[TRANSFORM.LOCAL_TY];
    data[TRANSFORM.WORLD_A] = a * pa + b * pc;
    data[TRANSFORM.WORLD_B] = a * pb + b * pd;
    data[TRANSFORM.WORLD_C] = c * pa + d * pc;
    data[TRANSFORM.WORLD_D] = c * pb + d * pd;
    data[TRANSFORM.WORLD_TX] = tx * pa + ty * pc + ptx;
    data[TRANSFORM.WORLD_TY] = tx * pb + ty * pd + pty;
    a = data[TRANSFORM.WORLD_A];
    b = data[TRANSFORM.WORLD_B];
    c = data[TRANSFORM.WORLD_C];
    d = data[TRANSFORM.WORLD_D];
    tx = data[TRANSFORM.WORLD_TX];
    ty = data[TRANSFORM.WORLD_TY];
    const x = data[TRANSFORM.FRAME_X1];
    const y = data[TRANSFORM.FRAME_Y1];
    const right = data[TRANSFORM.FRAME_X2];
    const bottom = data[TRANSFORM.FRAME_Y2];
    let x0 = x * a + tx;
    let y0 = y * d + ty;
    let x1 = x * a + tx;
    let y1 = bottom * d + ty;
    let x2 = right * a + tx;
    let y2 = bottom * d + ty;
    let x3 = right * a + tx;
    let y3 = y * d + ty;
    x0 += y * c;
    y0 += x * b;
    x1 += bottom * c;
    y1 += x * b;
    x2 += bottom * c;
    y2 += right * b;
    x3 += y * c;
    y3 += right * b;
    const bx = Math.min(x0, x1, x2, x3);
    const by = Math.min(y0, y1, y2, y3);
    const br = Math.max(x0, x1, x2, x3);
    const bb = Math.max(y0, y1, y2, y3);
    data[TRANSFORM.BOUNDS_X1] = bx;
    data[TRANSFORM.BOUNDS_Y1] = by;
    data[TRANSFORM.BOUNDS_X2] = br;
    data[TRANSFORM.BOUNDS_Y2] = bb;
    const inView = Number(!(cright < bx || cbottom < by || cx > br || cy > bb));
    data[TRANSFORM.IN_VIEW] = inView;
    if (inView === 1 || forceUpdate || parentIsDisplayList) {
      SetQuadPosition(id, x0, y0, x1, y1, x2, y2, x3, y3);
    }
    if (WillTransformChildren(id)) {
      SetDirtyWorldTransform(id);
    }
  }

  // ../phaser-genesis/src/components/vertices/SetQuadColor.ts
  function SetQuadColor(id, red, green, blue, alpha) {
    const data = QuadVertexComponent.values[id];
    data[5] = red;
    data[6] = green;
    data[7] = blue;
    data[8] = alpha;
    data[14] = red;
    data[15] = green;
    data[16] = blue;
    data[17] = alpha;
    data[23] = red;
    data[24] = green;
    data[25] = blue;
    data[26] = alpha;
    data[32] = red;
    data[33] = green;
    data[34] = blue;
    data[35] = alpha;
    data[41] = red;
    data[42] = green;
    data[43] = blue;
    data[44] = alpha;
    data[50] = red;
    data[51] = green;
    data[52] = blue;
    data[53] = alpha;
  }

  // ../phaser-genesis/src/components/vertices/SetUV.ts
  function SetUV(id, u0, v0, u1, v1) {
    const data = QuadVertexComponent.values[id];
    data[2] = u0;
    data[3] = v0;
    data[11] = u0;
    data[12] = v1;
    data[20] = u1;
    data[21] = v1;
    data[29] = u0;
    data[30] = v0;
    data[38] = u1;
    data[39] = v1;
    data[47] = u1;
    data[48] = v0;
  }

  // ../phaser-genesis/src/components/vertices/AddQuadVertex.ts
  function AddQuadVertex(id, width = 0, height = 0, flipY = true) {
    addComponent(GameObjectWorld, QuadVertexComponent, id);
    if (width || height) {
      if (flipY) {
        SetUV(id, 0, 1, 1, 0);
      } else {
        SetUV(id, 0, 0, 1, 1);
      }
      SetQuadColor(id, 1, 1, 1, 1);
      SetQuadPosition(id, 0, 0, 0, height, width, height, width, 0);
    }
  }

  // ../phaser-genesis/src/components/vertices/SetQuadTextureIndex.ts
  function SetQuadTextureIndex(id, textureIndex) {
    const data = QuadVertexComponent.values[id];
    if (data[4] !== textureIndex) {
      data[4] = textureIndex;
      data[13] = textureIndex;
      data[22] = textureIndex;
      data[31] = textureIndex;
      data[40] = textureIndex;
      data[49] = textureIndex;
    }
  }

  // ../phaser-genesis/src/animation/CreateAnimData.ts
  function CreateAnimData(currentAnim = "", frameRate = 0, duration = 0, delay = 0, repeat = 0, repeatDelay = 0, yoyo = false, hold = 0, showOnStart = false, hideOnComplete = false) {
    return {
      currentAnim,
      frameRate,
      duration,
      delay,
      repeat,
      repeatDelay,
      yoyo,
      hold,
      showOnStart,
      hideOnComplete,
      stopAfter: 0,
      startFrame: 0,
      timeScale: 1,
      onStart: null,
      onRepeat: null,
      onComplete: null,
      nextFrameTime: 0,
      repeatCount: 0,
      isPlaying: false,
      forceRestart: false,
      pendingStart: false,
      playingForward: true
    };
  }

  // ../phaser-genesis/src/renderer/webgl1/renderpass/GetVertexBufferEntry.ts
  var bufferEntry = {
    buffer: null,
    F32: null,
    offset: 0
  };
  function GetVertexBufferEntry(renderPass, addToCount = 0) {
    const buffer = renderPass.vertexbuffer.current;
    if (renderPass.count + addToCount >= buffer.batchSize) {
      Flush(renderPass);
    }
    bufferEntry.buffer = buffer;
    bufferEntry.F32 = buffer.vertexViewF32;
    bufferEntry.offset = renderPass.count * buffer.entryElementSize;
    renderPass.count += addToCount;
    return bufferEntry;
  }

  // ../phaser-genesis/src/renderer/webgl1/draw/BatchTexturedQuadBuffer.ts
  function BatchTexturedQuadBuffer(texture, id, renderPass) {
    const { F32, offset } = GetVertexBufferEntry(renderPass, 2);
    const textureIndex = renderPass.textures.set(texture);
    SetQuadTextureIndex(id, textureIndex);
    F32.set(QuadVertexComponent.values[id], offset);
  }

  // ../phaser-genesis/src/display/RemoveChildrenBetween.ts
  function RemoveChildrenBetween(parent, beginIndex = 0, endIndex) {
    const parentID = parent.id;
    if (endIndex === void 0) {
      endIndex = GetNumChildren(parentID);
    }
    const range = endIndex - beginIndex;
    if (range > 0 && range <= endIndex) {
      const children = GetChildIDsFromParent(parent);
      const removed2 = children.splice(beginIndex, range);
      removed2.forEach((childID) => {
        ClearWorldAndParentID(childID);
      });
      RelinkChildren(parentID, children);
      removed2.forEach((id) => parent.onRemoveChild(id));
      return removed2.map((id) => GameObjectCache.get(id));
    } else {
      return [];
    }
  }

  // ../phaser-genesis/src/display/DestroyChildren.ts
  function DestroyChildren(parent, beginIndex = 0, endIndex) {
    const removed2 = RemoveChildrenBetween(parent, beginIndex, endIndex);
    removed2.forEach((child) => {
      child.destroy();
    });
    const world2 = GetWorldFromParentID(parent.id);
    if (world2) {
      world2.updateDisplayList = true;
    }
  }

  // ../phaser-genesis/src/display/IsValidParent.ts
  function IsValidParent(parent, child) {
    const childID = child.id;
    const parentID = parent.id;
    return !(parentID === 0 || childID === parentID || parentID === GetParentID(childID));
  }

  // ../phaser-genesis/src/display/AddChild.ts
  function AddChild(parent, child) {
    if (IsValidParent(parent, child)) {
      const childID = child.id;
      const parentID = parent.id;
      const numChildren = GetNumChildren(parentID);
      RemoveChildIDFromCurrentParent(childID, parentID);
      if (numChildren === 0) {
        SetFirstChildID(parentID, childID);
      } else {
        const lastChild = GetLastChildID(parentID);
        LinkSiblings(lastChild, childID);
      }
      SetLastChildID(parentID, childID);
      SetAndUpdateParent(parentID, childID);
      parent.onAddChild(childID);
    }
    return child;
  }

  // ../phaser-genesis/src/display/ReparentChildren.ts
  function ReparentChildren(parent, newParent, beginIndex = 0, endIndex) {
    const moved = RemoveChildrenBetween(parent, beginIndex, endIndex);
    moved.forEach((child) => {
      AddChild(newParent, child);
    });
    return moved;
  }

  // ../phaser-genesis/src/gameobjects/GameObject.ts
  var GameObject = class {
    id = addEntity(GameObjectWorld);
    type = "GameObject";
    name = "";
    events;
    constructor() {
      const id = this.id;
      AddHierarchyComponent(id);
      AddPermissionsComponent(id);
      AddDirtyComponent(id);
      GameObjectCache.set(id, this);
    }
    isRenderable() {
      return WillRender(this.id);
    }
    beforeUpdate(delta, time) {
    }
    update(delta, time) {
    }
    afterUpdate(delta, time) {
    }
    preRenderGL(renderPass) {
    }
    renderGL(renderPass) {
    }
    renderCanvas(renderer) {
    }
    postRenderGL(renderPass) {
    }
    postRenderCanvas(renderer) {
    }
    set visible(value) {
      SetVisible(this.id, value);
    }
    get visible() {
      return GetVisible(this.id);
    }
    set visibleChildren(value) {
      SetVisibleChildren(this.id, value);
    }
    get visibleChildren() {
      return GetVisibleChildren(this.id);
    }
    hasParent(id) {
      const parentID = GetParentID(this.id);
      if (id) {
        return parentID === id;
      } else {
        return parentID > 0;
      }
    }
    getParent() {
      return GetParentGameObject(this.id);
    }
    getChildren(renderPass) {
      return GetChildrenFromParentID(this.id);
    }
    getNumChildren() {
      return GetNumChildren(this.id);
    }
    onAddChild(childID) {
    }
    onUpdateChild(childID) {
    }
    onRemoveChild(childID) {
    }
    getDisplayData() {
      const id = this.id;
      const data = HierarchyComponent.data[id];
      return {
        id,
        parent: data[HIERARCHY.PARENT],
        world: data[HIERARCHY.WORLD],
        numChildren: data[HIERARCHY.NUM_CHILDREN]
      };
    }
    toString() {
      return `${this.type} id="${this.id}" name="${this.name}"`;
    }
    destroy(reparentChildren) {
      if (reparentChildren) {
        ReparentChildren(this, reparentChildren);
      } else {
        DestroyChildren(this);
      }
    }
  };

  // ../phaser-genesis/src/config/defaultorigin/GetDefaultOriginX.ts
  function GetDefaultOriginX() {
    return ConfigStore.get(CONFIG_DEFAULTS.DEFAULT_ORIGIN).x;
  }

  // ../phaser-genesis/src/config/defaultorigin/GetDefaultOriginY.ts
  function GetDefaultOriginY() {
    return ConfigStore.get(CONFIG_DEFAULTS.DEFAULT_ORIGIN).y;
  }

  // ../phaser-genesis/src/renderer/webgl1/renderpass/PopColor.ts
  function PopColor(renderPass, color) {
    if (color.colorMatrixEnabled && color.willColorChildren) {
      renderPass.colorMatrix.pop();
    }
  }

  // ../phaser-genesis/src/renderer/webgl1/renderpass/SetColor.ts
  function SetColor(renderPass, color) {
    if (color.colorMatrixEnabled && color.willColorChildren) {
      renderPass.colorMatrix.set(color);
    }
  }

  // ../phaser-genesis/src/gameobjects/container/Container.ts
  var Container = class extends GameObject {
    type = "Container";
    position;
    scale;
    skew;
    origin;
    size;
    color;
    shader;
    _rotation = 0;
    constructor(x = 0, y = 0) {
      super();
      const id = this.id;
      AddTransform2DComponent(id);
      this.position = new Position(id, x, y);
      this.scale = new Scale(id);
      this.skew = new Skew(id);
      this.size = new Size(id);
      this.origin = new Origin(id, GetDefaultOriginX(), GetDefaultOriginY());
      this.color = new Color(id);
    }
    renderGL(renderPass) {
      if (this.shader) {
        Flush(renderPass);
        renderPass.shader.set(this.shader, 0);
      }
      SetColor(renderPass, this.color);
      this.preRenderGL(renderPass);
    }
    postRenderGL(renderPass) {
      if (this.shader) {
        Flush(renderPass);
        renderPass.shader.pop();
      }
      PopColor(renderPass, this.color);
    }
    set x(value) {
      this.position.x = value;
    }
    get x() {
      return this.position.x;
    }
    set y(value) {
      this.position.y = value;
    }
    get y() {
      return this.position.y;
    }
    set rotation(value) {
      this._rotation = value;
      const id = this.id;
      Transform2DComponent.data[id][TRANSFORM.ROTATION] = value;
      UpdateAxisAligned(id);
      SetDirtyTransform(id);
    }
    get rotation() {
      return this._rotation;
    }
    get alpha() {
      return this.color.alpha;
    }
    set alpha(value) {
      this.color.alpha = value;
    }
    setAlpha(value) {
      this.alpha = value;
      return this;
    }
    setPosition(x, y) {
      this.position.set(x, y);
      return this;
    }
    setScale(x, y) {
      this.scale.set(x, y);
      return this;
    }
    setRotation(value) {
      this.rotation = value;
      return this;
    }
    setSkew(x, y) {
      this.skew.set(x, y);
      return this;
    }
    setOrigin(x, y) {
      this.origin.set(x, y);
      return this;
    }
    getBounds() {
      const data = Transform2DComponent.data[this.id];
      const x = data[TRANSFORM.BOUNDS_X1];
      const y = data[TRANSFORM.BOUNDS_Y1];
      const right = data[TRANSFORM.BOUNDS_X2];
      const bottom = data[TRANSFORM.BOUNDS_Y2];
      return new Rectangle(x, y, right - x, bottom - y);
    }
    destroy(reparentChildren) {
      this.position.destroy();
      this.scale.destroy();
      this.skew.destroy();
      this.origin.destroy();
      super.destroy(reparentChildren);
    }
  };

  // ../phaser-genesis/src/textures/SetExtentFromFrame.ts
  function SetExtentFromFrame(child, frame2) {
    const originX = child.origin.x;
    const originY = child.origin.y;
    const sourceSizeWidth = frame2.sourceSizeWidth;
    const sourceSizeHeight = frame2.sourceSizeHeight;
    let x;
    let y;
    let width;
    let height;
    if (frame2.trimmed) {
      x = frame2.spriteSourceSizeX - originX * sourceSizeWidth;
      y = frame2.spriteSourceSizeY - originY * sourceSizeHeight;
      width = frame2.spriteSourceSizeWidth;
      height = frame2.spriteSourceSizeHeight;
    } else {
      x = -originX * sourceSizeWidth;
      y = -originY * sourceSizeHeight;
      width = sourceSizeWidth;
      height = sourceSizeHeight;
    }
    SetExtent(child.id, x, y, width, height);
    return child;
  }

  // ../phaser-genesis/src/textures/SetVertexUVsFromFrame.ts
  function SetVertexUVsFromFrame(id, frame2) {
    SetUV(id, frame2.u0, frame2.v0, frame2.u1, frame2.v1);
    return frame2;
  }

  // ../phaser-genesis/src/gameobjects/sprite/SetFrame.ts
  function SetFrame(texture, key, ...children) {
    const frame2 = texture.getFrame(key);
    const pivot = frame2.pivot;
    children.forEach((child) => {
      if (!child || frame2 === child.frame) {
        return;
      }
      child.frame = frame2;
      child.hasTexture = true;
      if (pivot) {
        child.origin.set(pivot.x, pivot.y);
      }
      SetExtentFromFrame(child, frame2);
      SetVertexUVsFromFrame(child.id, frame2);
    });
    return children;
  }

  // ../phaser-genesis/src/gameobjects/sprite/SetTexture.ts
  function SetTexture(key, frame2, ...children) {
    if (!key) {
      children.forEach((child) => {
        child.texture = null;
        child.frame = null;
        child.hasTexture = false;
      });
    } else {
      let texture;
      if (key instanceof Frame) {
        frame2 = key;
        texture = key.texture;
      } else if (key instanceof Texture) {
        texture = key;
      } else {
        texture = GetTexture(key);
      }
      if (!texture) {
        console.warn(`Invalid Texture key: ${key}`);
      } else {
        children.forEach((child) => {
          child.texture = texture;
        });
        SetFrame(texture, frame2, ...children);
      }
    }
    return children;
  }

  // ../phaser-genesis/src/gameobjects/sprite/Sprite.ts
  var Sprite = class extends Container {
    type = "Sprite";
    texture;
    frame;
    hasTexture = false;
    constructor(x, y, texture = "__BLANK", frame2) {
      super(x, y);
      AddQuadVertex(this.id);
      this.setTexture(texture, frame2);
    }
    setTexture(key, frame2) {
      SetTexture(key, frame2, this);
      return this;
    }
    setFrame(key) {
      SetFrame(this.texture, key, this);
      return this;
    }
    isRenderable() {
      return this.visible && this.hasTexture && WillRender(this.id) && this.alpha > 0;
    }
    renderGL(renderPass) {
      const color = this.color;
      if (this.shader) {
        Flush(renderPass);
        renderPass.shader.set(this.shader, 0);
      }
      if (color.colorMatrixEnabled) {
        renderPass.colorMatrix.set(color);
      }
      this.preRenderGL(renderPass);
      BatchTexturedQuadBuffer(this.texture, this.id, renderPass);
      if (color.colorMatrixEnabled && !color.willColorChildren) {
        Flush(renderPass);
        renderPass.colorMatrix.pop();
      }
    }
    renderCanvas(renderer) {
    }
    destroy(reparentChildren) {
      super.destroy(reparentChildren);
      this.texture = null;
      this.frame = null;
      this.hasTexture = false;
    }
  };

  // ../phaser-genesis/src/gameobjects/animatedsprite/AnimatedSprite.ts
  var AnimatedSprite = class extends Sprite {
    currentAnimation;
    currentFrame;
    animData;
    hasStarted = false;
    forward = true;
    inReverse = false;
    accumulator = 0;
    nextTick = 0;
    delayCounter = 0;
    repeatCounter = 0;
    pendingRepeat = false;
    paused = false;
    wasPlaying = false;
    pendingStop = 0;
    pendingStopValue = 0;
    constructor(x, y, texture, frame2) {
      super(x, y, texture, frame2);
      this.animData = CreateAnimData();
    }
    handleStart() {
      if (this.animData.showOnStart) {
        this.visible = true;
      }
      this.setCurrentFrame(this.currentFrame);
      this.hasStarted = true;
    }
    handleRepeat() {
      this.pendingRepeat = false;
    }
    handleStop() {
      this.pendingStop = 0;
      this.animData.isPlaying = false;
    }
    handleComplete() {
      this.pendingStop = 0;
      this.animData.isPlaying = false;
      if (this.animData.hideOnComplete) {
        this.visible = false;
      }
    }
    reverse() {
      if (this.isPlaying) {
        this.inReverse = !this.inReverse;
        this.forward = !this.forward;
      }
      return this;
    }
    getProgress() {
      const frame2 = this.currentFrame;
      if (!frame2) {
        return 0;
      }
      let p = frame2.progress;
      if (this.inReverse) {
        p *= -1;
      }
      return p;
    }
    stop() {
      this.pendingStop = 0;
      this.animData.isPlaying = false;
      if (this.currentAnimation) {
        this.handleStop();
      }
      return this;
    }
    update(delta, now) {
      super.update(delta, now);
      const data = this.animData;
      const anim = this.currentAnimation;
      if (!anim || !data.isPlaying || anim.paused) {
        return;
      }
      this.accumulator += delta * data.timeScale;
      if (this.pendingStop === 1) {
        this.pendingStopValue -= delta;
        if (this.pendingStopValue <= 0) {
          this.stop();
          return;
        }
      }
      if (!this.hasStarted) {
        if (this.accumulator >= this.delayCounter) {
          this.accumulator -= this.delayCounter;
          this.handleStart();
        }
      } else if (this.accumulator >= this.nextTick) {
        if (this.forward) {
          this.nextFrame();
        } else {
          this.prevFrame();
        }
        if (data.isPlaying && this.pendingStop === 0 && anim.skipMissedFrames && this.accumulator > this.nextTick) {
          let safetyNet = 0;
          do {
            if (this.forward) {
              this.nextFrame();
            } else {
              this.prevFrame();
            }
            safetyNet++;
          } while (data.isPlaying && this.accumulator > this.nextTick && safetyNet < 60);
        }
      }
    }
    nextFrame() {
      const frame2 = this.currentFrame;
      const data = this.animData;
      if (frame2.isLast) {
        if (data.yoyo) {
          this.handleYoyoFrame(false);
        } else if (this.repeatCounter > 0) {
          if (this.inReverse && this.forward) {
            this.forward = false;
          } else {
            this.repeatAnimation();
          }
        } else {
          this.complete();
        }
      } else {
        this.setCurrentFrame(this.currentFrame.nextFrame);
        this.getNextTick();
      }
      return this;
    }
    repeatAnimation() {
      if (this.pendingStop === 2) {
        if (this.pendingStopValue === 0) {
          return this.stop();
        } else {
          this.pendingStopValue--;
        }
      }
      const data = this.animData;
      if (data.repeatDelay > 0 && !this.pendingRepeat) {
        this.pendingRepeat = true;
        this.accumulator -= this.nextTick;
        this.nextTick += data.repeatDelay;
      } else {
        this.repeatCounter--;
        if (this.forward) {
          this.setCurrentFrame(this.currentFrame.nextFrame);
        } else {
          this.setCurrentFrame(this.currentFrame.prevFrame);
        }
        if (this.isPlaying) {
          this.getNextTick();
          this.handleRepeat();
        }
      }
    }
    setCurrentFrame(animFrame) {
      this.currentFrame = animFrame;
      this.setTexture(animFrame.texture, animFrame.frame);
    }
    getNextTick() {
      this.accumulator -= this.nextTick;
      this.nextTick = this.currentAnimation.msPerFrame + this.currentFrame.duration;
    }
    handleYoyoFrame(isReverse = false) {
      const animData = this.animData;
      if (this.inReverse === !isReverse && this.repeatCounter > 0) {
        if (animData.repeatDelay === 0 || this.pendingRepeat) {
          this.forward = isReverse;
        }
        this.repeatAnimation();
        return;
      }
      if (this.inReverse !== isReverse && this.repeatCounter === 0) {
        this.complete();
        return;
      }
      this.forward = isReverse;
      if (isReverse) {
        this.setCurrentFrame(this.currentFrame.nextFrame);
      } else {
        this.setCurrentFrame(this.currentFrame.prevFrame);
      }
      this.getNextTick();
    }
    prevFrame() {
      const frame2 = this.currentFrame;
      const animData = this.animData;
      if (frame2.isFirst) {
        if (animData.yoyo) {
          this.handleYoyoFrame(true);
        } else if (this.repeatCounter > 0) {
          if (this.inReverse && !this.forward) {
            this.repeatAnimation();
          } else {
            this.forward = true;
            this.repeatAnimation();
          }
        } else {
          this.complete();
        }
      } else {
        this.setCurrentFrame(frame2.prevFrame);
        this.getNextTick();
      }
      return this;
    }
    complete() {
      this.pendingStop = 0;
      this.animData.isPlaying = false;
      if (this.currentAnimation) {
        this.handleComplete();
      }
    }
    play() {
      const data = this.animData;
      if (data.repeat === -1) {
        this.repeatCounter = Number.MAX_VALUE;
      }
      data.isPlaying = true;
      if (data.delay === 0) {
        this.setTexture(this.currentFrame.texture, this.currentFrame.frame);
        if (data.onStart) {
          data.onStart(this, this.currentAnimation);
        }
      } else {
        data.pendingStart = true;
      }
      return this;
    }
    pause(atFrame) {
      if (!this.paused) {
        this.paused = true;
        this.wasPlaying = this.isPlaying;
        this.animData.isPlaying = false;
      }
      if (atFrame) {
        this.setCurrentFrame(atFrame);
      }
      return this;
    }
    resume(fromFrame) {
      if (this.paused) {
        this.paused = false;
        this.animData.isPlaying = this.wasPlaying;
      }
      if (fromFrame) {
        this.setCurrentFrame(fromFrame);
      }
      return this;
    }
    get isPlaying() {
      return this.animData.isPlaying;
    }
    get isPlayingForward() {
      return this.animData.isPlaying && this.forward;
    }
    destroy(reparentChildren) {
      super.destroy(reparentChildren);
      this.animData = null;
    }
  };

  // ../phaser-genesis/src/math/spatialgrid/SpatialHashGrid.ts
  var SpatialHashGrid = class {
    cellWidth;
    cellHeight;
    cells;
    ids;
    index;
    getBounds;
    constructor(cellWidth, cellHeight, getBounds = GetLocalBounds) {
      this.cellWidth = Math.abs(cellWidth);
      this.cellHeight = Math.abs(cellHeight);
      this.cells = new Map();
      this.ids = [];
      this.index = 0;
      this.getBounds = getBounds;
    }
    clear() {
      this.cells.forEach((cell) => cell.clear());
      this.cells.clear();
      this.ids = [];
      this.index = 0;
    }
    getX(x) {
      return Math.floor(x / this.cellWidth);
    }
    getY(y) {
      return Math.floor(y / this.cellHeight);
    }
    getXCeil(x) {
      return Math.ceil(x / this.cellWidth);
    }
    getYCeil(y) {
      return Math.ceil(y / this.cellHeight);
    }
    getKey(x, y) {
      return `${this.getX(x)} ${this.getY(y)}`;
    }
    getGridKey(x, y) {
      return `${x} ${y}`;
    }
    addToCell(id, gridX, gridY) {
      const cells = this.cells;
      const key = this.getGridKey(gridX, gridY);
      if (cells.has(key)) {
        cells.get(key).add(id);
      } else {
        cells.set(key, new Set([id]));
      }
      return key;
    }
    inView(x, y, width, height) {
      return this.intersects(x, y, x + width, y + height);
    }
    intersects(left, top, right, bottom) {
      const topLeftX = this.getX(left);
      const topLeftY = this.getY(top);
      const bottomRightX = this.getX(right);
      const bottomRightY = this.getY(bottom);
      const cells = this.cells;
      let results = [];
      if (topLeftX === bottomRightX && topLeftY === bottomRightY) {
        const key = this.getGridKey(topLeftX, topLeftY);
        if (cells.has(key)) {
          results = [...cells.get(key)];
        }
      } else {
        const width = bottomRightX - topLeftX + 1;
        const height = bottomRightY - topLeftY + 1;
        let gridX = topLeftX;
        let gridY = topLeftY;
        let placed = 0;
        for (let i = 0; i < width * height; i++) {
          const key = this.getGridKey(gridX, gridY);
          if (cells.has(key)) {
            results = results.concat(...cells.get(key));
          }
          gridX++;
          placed++;
          if (placed === width) {
            gridX = topLeftX;
            gridY++;
            placed = 0;
          }
        }
      }
      const ids = this.ids;
      results.sort((a, b) => {
        return ids[a] - ids[b];
      });
      return new Set(results);
    }
    add(id) {
      const { left, top, right, bottom } = this.getBounds(id);
      const topLeftX = this.getX(left);
      const topLeftY = this.getY(top);
      const bottomRightX = this.getXCeil(right);
      const bottomRightY = this.getYCeil(bottom);
      const width = bottomRightX - topLeftX;
      const height = bottomRightY - topLeftY;
      this.ids[id] = this.index++;
      if (width === 1 && height === 1) {
        this.addToCell(id, topLeftX, topLeftY);
        return;
      }
      let gridX = topLeftX;
      let gridY = topLeftY;
      let placed = 0;
      for (let i = 0; i < width * height; i++) {
        this.addToCell(id, gridX, gridY);
        gridX++;
        placed++;
        if (placed === width) {
          gridX = topLeftX;
          gridY++;
          placed = 0;
        }
      }
    }
    update(id) {
      this.remove(id);
      this.add(id);
    }
    has(id) {
      return !!this.ids[id];
    }
    getAll() {
      return this.ids.filter((index, id) => id !== void 0);
    }
    remove(id) {
      if (this.has(id)) {
        this.cells.forEach((cell) => cell.delete(id));
        this.ids[id] = void 0;
      }
    }
  };

  // ../phaser-genesis/src/gameobjects/spatialgridlayer/SpatialGridLayer.ts
  var SpatialGridLayer = class extends GameObject {
    type = "SpatialGridLayer";
    hash;
    onSortChildren;
    constructor(cellWidth = 512, cellHeight = 512, updateChildren = false) {
      super();
      this.hash = new SpatialHashGrid(cellWidth, cellHeight);
      const id = this.id;
      SetCustomDisplayList(id, true);
      SetWillTransformChildren(id, false);
      SetWillUpdateChildren(id, updateChildren);
    }
    getChildren(renderPass) {
      ClearDirtyDisplayList(this.id);
      const camera = renderPass.current2DCamera;
      const cx = camera.getBoundsX();
      const cy = camera.getBoundsY();
      const cright = camera.getBoundsRight();
      const cbottom = camera.getBoundsBottom();
      const childIDs = this.hash.intersects(cx, cy, cright, cbottom);
      const result = [];
      childIDs.forEach((id) => {
        result.push(GameObjectCache.get(id));
      });
      if (this.onSortChildren) {
        result.sort(this.onSortChildren);
      }
      return result;
    }
    onAddChild(childID) {
      if (!HasDirtyTransform(childID)) {
        this.hash.add(childID);
      }
      const worldID = GetWorldID(this.id);
      SetDirtyDisplayList(this.id);
      SetDirtyChildTransform(worldID);
      SetDirtyChildColor(worldID);
    }
    onUpdateChild(childID) {
      this.hash.update(childID);
    }
    onRemoveChild(childID) {
      this.hash.remove(childID);
      SetDirtyDisplayList(this.id);
    }
    destroy(reparentChildren) {
      this.hash.clear();
      super.destroy(reparentChildren);
    }
  };

  // ../phaser-genesis/src/gameobjects/text/Text.ts
  var Text = class extends Sprite {
    type = "Text";
    _text;
    preRenderCallback;
    wordWrapCallback;
    canvas;
    context;
    splitRegExp = /(?:\r\n|\r|\n)/;
    padding = { left: 0, right: 0, top: 0, bottom: 0 };
    verticalAlign = "ascent";
    lineSpacing = 0;
    resolution;
    font = "16px monospace";
    fillStyle = "#fff";
    strokeStyle = "";
    backgroundStyle = "";
    cornerRadius = 0;
    textAlign = "left";
    textBaseline = "alphabetic";
    lineWidth = 0;
    lineDash = [];
    fixedWidth;
    fixedHeight;
    antialias = false;
    constructor(x, y, text = "", font, fillStyle) {
      super(x, y, CanvasTexture());
      this.texture.key = `Text${this.id}`;
      const renderer = RendererInstance.get();
      this.resolution = renderer.resolution;
      this.canvas = this.texture.image;
      this.context = this.canvas.getContext("2d");
      if (font) {
        this.font = font;
      }
      if (fillStyle) {
        this.fillStyle = fillStyle;
      }
      this.setText(text);
    }
    syncContext(canvas, ctx) {
      if (this.preRenderCallback) {
        this.preRenderCallback(canvas, ctx);
      }
      ctx.font = this.font;
      ctx.textBaseline = this.textBaseline;
      ctx.textAlign = this.textAlign;
      ctx.fillStyle = this.fillStyle;
      ctx.strokeStyle = this.strokeStyle;
      ctx.lineWidth = this.lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.setLineDash(this.lineDash);
      ctx.imageSmoothingEnabled = this.antialias;
    }
    updateText() {
      const canvas = this.canvas;
      const ctx = this.context;
      const resolution = this.resolution;
      const lines = this._text.split(this.splitRegExp);
      const padding = this.padding;
      const fillStyle = this.fillStyle;
      const strokeStyle = this.strokeStyle;
      const strokeWidth = this.lineWidth;
      const lineSpacing = this.lineSpacing;
      const strokeWidthHalf = strokeWidth > 0 ? strokeWidth / 2 : 0;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.syncContext(canvas, ctx);
      ctx.textAlign = "start";
      let maxWidth = 0;
      let maxHeight = 0;
      let y = 0;
      const lineMetrics = [];
      const vAlignAscent = this.verticalAlign === "ascent";
      const metrics = ctx.measureText("|M\xC9q");
      const averageLineHeight = Math.ceil(Math.abs(metrics.actualBoundingBoxAscent) + Math.abs(metrics.actualBoundingBoxDescent)) + strokeWidth;
      for (let i = 0; i < lines.length; i++) {
        const metrics2 = ctx.measureText(lines[i]);
        const left = metrics2.actualBoundingBoxLeft;
        const right = metrics2.actualBoundingBoxRight;
        let ascent = metrics2.actualBoundingBoxAscent;
        let descent = metrics2.actualBoundingBoxDescent;
        if (!ascent && !descent || lines[i] === "") {
          ascent = averageLineHeight;
          descent = 0;
        }
        const lineWidth = Math.ceil(Math.abs(left) + Math.abs(right)) + strokeWidth;
        const lineHeight = Math.ceil(Math.abs(ascent) + Math.abs(descent)) + strokeWidth;
        if (vAlignAscent) {
          y += ascent + strokeWidthHalf;
          if (i > 0) {
            y += lineSpacing + strokeWidthHalf;
          }
          maxHeight = y + descent + strokeWidthHalf;
        } else {
          y = maxHeight + (lineHeight - descent - strokeWidthHalf);
          maxHeight += lineHeight;
          if (i < lines.length - 1) {
            maxHeight += lineSpacing;
          }
        }
        maxWidth = Math.max(maxWidth, lineWidth);
        lineMetrics.push({ lineWidth, lineHeight, ascent, descent, left, right, y });
      }
      maxWidth += padding.left + padding.right;
      maxHeight += padding.top + padding.bottom;
      const displayWidth = this.fixedWidth ? this.fixedWidth : maxWidth;
      const displayHeight = this.fixedHeight ? this.fixedHeight : maxHeight;
      const canvasWidth = Math.ceil(displayWidth * resolution);
      const canvasHeight = Math.ceil(displayHeight * resolution);
      if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        this.texture.setSize(displayWidth, displayHeight);
        this.size.set(displayWidth, displayHeight);
      }
      ctx.save();
      ctx.scale(resolution, resolution);
      this.syncContext(canvas, ctx);
      const backgroundStyle = this.backgroundStyle;
      if (backgroundStyle) {
        ctx.save();
        ctx.fillStyle = backgroundStyle;
        ctx.strokeStyle = backgroundStyle;
        const cornerRadius = this.cornerRadius;
        const halfRadius = cornerRadius > 0 ? cornerRadius / 2 : 0;
        if (cornerRadius) {
          ctx.lineWidth = cornerRadius;
          ctx.strokeRect(halfRadius, halfRadius, displayWidth - cornerRadius, displayHeight - cornerRadius);
        }
        ctx.fillRect(halfRadius, halfRadius, displayWidth - cornerRadius, displayHeight - cornerRadius);
        ctx.restore();
      }
      const textAlign = this.textAlign;
      const isCenter = textAlign === "center";
      const isRight = textAlign === "right" || textAlign === "end";
      const yOffset = (displayHeight - maxHeight) / 2 + padding.top;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const metrics2 = lineMetrics[i];
        let tx = padding.left + metrics2.left + strokeWidthHalf;
        const ty = yOffset + metrics2.y;
        if (isCenter) {
          tx = displayWidth / 2;
        } else if (isRight) {
          tx = displayWidth - strokeWidthHalf;
        }
        if (strokeStyle) {
          ctx.strokeText(line, tx, ty);
        }
        if (fillStyle) {
          ctx.fillText(line, tx, ty);
        }
      }
      ctx.restore();
      if (this.texture.binding) {
        this.texture.binding.update();
      }
      return this;
    }
    get text() {
      return this._text;
    }
    set text(value) {
      this.setText(value);
    }
    setText(value = "") {
      if (Array.isArray(value)) {
        value = value.join("\n");
      }
      if (value !== this._text) {
        this._text = value.toString();
        this.updateText();
      }
      return this;
    }
    destroy(reparentChildren) {
      this.texture.destroy();
      this.fillStyle = null;
      this.strokeStyle = null;
      this.backgroundStyle = null;
      this.canvas = null;
      this.context = null;
      super.destroy(reparentChildren);
    }
  };

  // ../phaser-genesis/src/utils/array/GetRandom.ts
  function GetRandom(array, startIndex = 0, length) {
    if (!length) {
      length = array.length;
    }
    const randomIndex = startIndex + Math.floor(Math.random() * length);
    return array[randomIndex];
  }

  // ../phaser-genesis/src/display/RemoveChild.ts
  function RemoveChild(parent, child) {
    const childID = child.id;
    const parentID = parent.id;
    if (child.hasParent(parentID)) {
      RemoveChildID(childID);
      DecreaseNumChildren(parentID);
      parent.onRemoveChild(childID);
    }
    return child;
  }

  // ../phaser-genesis/src/display/RemoveChildren.ts
  function RemoveChildren(parent, ...children) {
    children.forEach((child) => {
      RemoveChild(parent, child);
    });
    return children;
  }

  // ../phaser-genesis/src/math/mat2d/Matrix2D.ts
  var Matrix2D = class {
    a;
    b;
    c;
    d;
    tx;
    ty;
    constructor(a = 1, b = 0, c = 0, d = 1, tx = 0, ty = 0) {
      this.set(a, b, c, d, tx, ty);
    }
    set(a = 1, b = 0, c = 0, d = 1, tx = 0, ty = 0) {
      this.a = a;
      this.b = b;
      this.c = c;
      this.d = d;
      this.tx = tx;
      this.ty = ty;
      return this;
    }
    identity() {
      return this.set();
    }
    toArray() {
      const { a, b, c, d, tx, ty } = this;
      return [a, b, c, d, tx, ty];
    }
    fromArray(src) {
      return this.set(src[0], src[1], src[2], src[3], src[4], src[5]);
    }
  };

  // ../phaser-genesis/src/math/mat2d/Mat2dAppend.ts
  function Mat2dAppend(mat1, mat2, out = new Matrix2D()) {
    const { a: a1, b: b1, c: c1, d: d1, tx: tx1, ty: ty1 } = mat1;
    const { a: a2, b: b2, c: c2, d: d2, tx: tx2, ty: ty2 } = mat2;
    return out.set(a2 * a1 + b2 * c1, a2 * b1 + b2 * d1, c2 * a1 + d2 * c1, c2 * b1 + d2 * d1, tx2 * a1 + ty2 * c1 + tx1, tx2 * b1 + ty2 * d1 + ty1);
  }

  // ../phaser-genesis/src/math/mat2d/Mat2dGlobalToLocal.ts
  function Mat2dGlobalToLocal(mat, x, y, out = new Vec2()) {
    const { a, b, c, d, tx, ty } = mat;
    const id = 1 / (a * d + c * -b);
    return out.set(d * id * x + -c * id * y + (ty * c - tx * d) * id, a * id * y + -b * id * x + (-ty * a + tx * b) * id);
  }

  // ../phaser-genesis/src/math/Between.ts
  function Between(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  // ../phaser-genesis/src/animation/CalculateDuration.ts
  function CalculateDuration(animation, frameRate, duration) {
    const totalFrames = animation.frames.size;
    if (!Number.isFinite(duration) && !Number.isFinite(frameRate)) {
      animation.frameRate = 24;
      animation.duration = 24 / totalFrames * 1e3;
    } else if (duration && !Number.isFinite(frameRate)) {
      animation.duration = duration;
      animation.frameRate = totalFrames / (duration / 1e3);
    } else {
      animation.frameRate = frameRate;
      animation.duration = totalFrames / frameRate * 1e3;
    }
    animation.msPerFrame = 1e3 / animation.frameRate;
    return animation;
  }

  // ../phaser-genesis/src/animation/LinkFrames.ts
  function LinkFrames(animation) {
    const totalFrames = animation.frames.size;
    if (totalFrames === 0) {
      return animation;
    }
    let i = 0;
    const framePercent = 1 / totalFrames;
    let firstFrame;
    let prevFrame2;
    for (const frame2 of animation.frames.values()) {
      if (!prevFrame2) {
        frame2.isFirst = true;
        animation.firstFrame = frame2;
        firstFrame = frame2;
      } else {
        prevFrame2.nextFrame = frame2;
        frame2.prevFrame = prevFrame2;
      }
      prevFrame2 = frame2;
      i++;
      frame2.progress = framePercent * i;
      if (i === totalFrames) {
        frame2.isLast = true;
        frame2.nextFrame = firstFrame;
        firstFrame.prevFrame = frame2;
      }
    }
    return animation;
  }

  // ../phaser-genesis/src/animation/Animation.ts
  var Animation = class {
    key;
    frames;
    firstFrame;
    msPerFrame;
    frameRate;
    duration;
    skipMissedFrames;
    delay;
    hold;
    repeat;
    repeatDelay;
    yoyo;
    showOnStart;
    hideOnComplete;
    paused;
    constructor(config) {
      const {
        key,
        frames = [],
        frameRate = null,
        duration = null,
        skipMissedFrames = true,
        delay = 0,
        repeat = 0,
        repeatDelay = 0,
        yoyo = false,
        showOnStart = false,
        hideOnComplete = false,
        paused = false
      } = config;
      this.key = key;
      this.skipMissedFrames = skipMissedFrames;
      this.delay = delay;
      this.repeat = repeat;
      this.repeatDelay = repeatDelay;
      this.yoyo = yoyo;
      this.showOnStart = showOnStart;
      this.hideOnComplete = hideOnComplete;
      this.paused = paused;
      this.frames = new Set(frames);
      CalculateDuration(this, frameRate, duration);
      LinkFrames(this);
    }
    getTotalFrames() {
      return this.frames.size;
    }
    destroy() {
      this.frames.clear();
    }
  };

  // ../phaser-genesis/src/animation/AnimationFrame.ts
  var AnimationFrame = class {
    texture;
    frame;
    isFirst = false;
    isLast = false;
    isKeyFrame = false;
    nextFrame;
    prevFrame;
    duration = 0;
    progress = 0;
    constructor(texture, frame2) {
      this.texture = texture;
      this.frame = frame2;
    }
    destroy() {
      this.texture = null;
      this.frame = null;
      this.nextFrame = null;
      this.prevFrame = null;
    }
  };

  // ../phaser-genesis/src/animation/CreateAnimationFromAtlas.ts
  function CreateAnimationFromAtlas(config) {
    const texture = config.texture instanceof Texture ? config.texture : GetTexture(config.texture);
    const frames = [];
    GetFramesInRange(texture, config).forEach((frame2) => {
      frames.push(new AnimationFrame(texture, frame2));
    });
    return new Animation({ frames, ...config });
  }

  // ../phaser-genesis/src/config/banner/AddBanner.ts
  function AddBanner() {
    const { title, version, url, color, background } = ConfigStore.get(CONFIG_DEFAULTS.BANNER);
    if (title !== "") {
      const str = `${title} ${version}`.trimEnd();
      console.log(`%c${str}%c ${url}`, `padding: 4px 16px; color: ${color}; background: ${background}`, "");
    }
  }

  // ../phaser-genesis/src/config/globalvar/AddGlobalVar.ts
  function AddGlobalVar(game2) {
    const globalVar = ConfigStore.get(CONFIG_DEFAULTS.GLOBAL_VAR);
    if (globalVar && window) {
      window[globalVar] = game2;
    }
  }

  // ../phaser-genesis/src/dom/AddToDOM.ts
  function AddToDOM(element, parent) {
    const target = GetElement(parent);
    target.appendChild(element);
    return element;
  }

  // ../phaser-genesis/src/config/parent/AddToParent.ts
  function AddToParent() {
    const parent = ConfigStore.get(CONFIG_DEFAULTS.PARENT);
    const canvas = RendererInstance.get().canvas;
    if (parent && canvas) {
      AddToDOM(canvas, parent);
    }
  }

  // ../phaser-genesis/src/config/renderer/CreateRenderer.ts
  function CreateRenderer() {
    const renderer = ConfigStore.get(CONFIG_DEFAULTS.RENDERER);
    if (renderer) {
      new renderer();
    }
  }

  // ../phaser-genesis/src/config/scenes/GetScenes.ts
  function GetScenes() {
    return ConfigStore.get(CONFIG_DEFAULTS.SCENES);
  }

  // ../phaser-genesis/src/events/EventInstance.ts
  var EventInstance = class {
    callback;
    context;
    once;
    constructor(callback, context, once = false) {
      this.callback = callback;
      this.context = context;
      this.once = once;
    }
  };

  // ../phaser-genesis/src/events/On.ts
  function On(emitter, event, callback, context = emitter, once = false) {
    if (typeof callback !== "function") {
      throw new TypeError("Listener not a function");
    }
    const listener = new EventInstance(callback, context, once);
    const listeners = emitter.events.get(event);
    if (!listeners) {
      emitter.events.set(event, new Set([listener]));
    } else {
      listeners.add(listener);
    }
    return listener;
  }

  // ../phaser-genesis/src/events/Once.ts
  function Once(emitter, event, callback, context = emitter) {
    return On(emitter, event, callback, context, true);
  }

  // ../phaser-genesis/src/scenes/SceneManagerInstance.ts
  var instance6;
  var SceneManagerInstance = {
    get: () => {
      return instance6;
    },
    set: (manager) => {
      if (instance6) {
        throw new Error("Cannot instantiate SceneManager more than once");
      }
      instance6 = manager;
    }
  };

  // ../phaser-genesis/src/world/WorldList.ts
  var WorldList = new Map();

  // ../phaser-genesis/src/scenes/SceneManager.ts
  var SceneManager = class {
    id = addEntity(GameObjectWorld);
    game;
    scenes = new Map();
    sceneIndex = 0;
    flush;
    constructor() {
      SceneManagerInstance.set(this);
      this.game = GameInstance.get();
      Once(this.game, "boot", () => this.boot());
    }
    boot() {
      const scenes = GetScenes();
      if (scenes) {
        scenes.forEach((scene) => new scene());
      }
    }
    update() {
      const time = this.game.time;
      const delta = time.delta;
      const now = time.lastTick;
      for (const scene of this.scenes.values()) {
        const worlds2 = WorldList.get(scene);
        for (const world2 of worlds2) {
          world2.beforeUpdate(delta, now);
        }
        if (scene.update) {
          scene.update(delta, now);
        }
        for (const world2 of worlds2) {
          world2.update(delta, now);
        }
        for (const world2 of worlds2) {
          world2.afterUpdate(delta, now);
        }
      }
    }
    preRender() {
      const gameFrame = this.game.time.frame;
      for (const scene of this.scenes.values()) {
        const worlds2 = WorldList.get(scene);
        for (const world2 of worlds2) {
          if (world2.preRender(gameFrame)) {
            this.flush = true;
          }
        }
      }
    }
    render(renderPass) {
      for (const scene of this.scenes.values()) {
        const worlds2 = WorldList.get(scene);
        for (const world2 of worlds2) {
          world2.renderGL(renderPass);
        }
      }
      this.flush = false;
    }
  };

  // ../phaser-genesis/src/scenes/CreateSceneManager.ts
  function CreateSceneManager() {
    new SceneManager();
  }

  // ../phaser-genesis/src/world/CreateWorldRenderData.ts
  function CreateWorldRenderData() {
    return {
      gameFrame: 0,
      dirtyLocal: 0,
      dirtyWorld: 0,
      dirtyQuad: 0,
      dirtyColor: 0,
      dirtyView: 0,
      numChildren: 0,
      rendered: 0,
      renderMs: 0,
      preRenderMs: 0,
      updated: 0,
      updateMs: 0,
      fps: 0,
      delta: 0,
      processed: 0
    };
  }

  // ../phaser-genesis/src/dom/DOMContentLoaded.ts
  function DOMContentLoaded(callback) {
    const readyState = document.readyState;
    if (readyState === "complete" || readyState === "interactive") {
      callback();
      return;
    }
    const check = () => {
      document.removeEventListener("deviceready", check, true);
      document.removeEventListener("DOMContentLoaded", check, true);
      window.removeEventListener("load", check, true);
      callback();
    };
    if (!document.body) {
      window.setTimeout(check, 20);
    } else if (window.hasOwnProperty("cordova")) {
      document.addEventListener("deviceready", check, true);
    } else {
      document.addEventListener("DOMContentLoaded", check, true);
      window.addEventListener("load", check, true);
    }
  }

  // ../phaser-genesis/src/events/EventEmitter.ts
  var EventEmitter = class {
    events;
    constructor() {
      this.events = new Map();
    }
  };

  // ../phaser-genesis/src/world/ResetWorldRenderData.ts
  function ResetWorldRenderData(renderData) {
    renderData.rendered = 0;
    renderData.dirtyColor = 0;
    renderData.dirtyLocal = 0;
    renderData.dirtyView = 0;
    renderData.dirtyWorld = 0;
    renderData.dirtyQuad = 0;
    renderData.processed = 0;
    renderData.renderMs = 0;
    renderData.preRenderMs = 0;
    renderData.updated = 0;
    renderData.updateMs = 0;
  }

  // ../phaser-genesis/src/scenes/GetConfigValue.ts
  function GetConfigValue(config, property, defaultValue) {
    if (Object.prototype.hasOwnProperty.call(config, property)) {
      return config[property];
    } else {
      return defaultValue;
    }
  }

  // ../phaser-genesis/src/scenes/Install.ts
  function Install(scene, config = {}) {
    const sceneManager = SceneManagerInstance.get();
    const size = sceneManager.scenes.size;
    const sceneIndex = sceneManager.sceneIndex;
    const firstScene = size === 0;
    if (typeof config === "string") {
      scene.key = config;
    } else if (config || !config && firstScene) {
      scene.key = GetConfigValue(config, "key", "scene" + sceneIndex.toString());
    }
    if (sceneManager.scenes.has(scene.key)) {
      console.warn("Scene key already in use: " + scene.key);
    } else {
      sceneManager.scenes.set(scene.key, scene);
      sceneManager.flush = true;
      sceneManager.sceneIndex++;
    }
    WorldList.set(scene, []);
  }

  // ../phaser-genesis/src/scenes/RenderStats.ts
  var RenderStats = {
    fps: 0,
    delta: 0,
    gameFrame: 0,
    numScenes: 0,
    numWorlds: 0,
    numGameObjects: 0,
    numGameObjectsRendered: 0,
    numDirtyLocalTransforms: 0,
    numDirtyWorldTransforms: 0,
    numDirtyVertices: 0,
    numDirtyWorldLists: 0,
    numDirtyCameras: 0
  };

  // ../phaser-genesis/src/scenes/Scene.ts
  var Scene = class {
    key;
    game;
    events;
    constructor(config) {
      this.game = GameInstance.get();
      this.events = new Map();
      Install(this, config);
    }
  };

  // ../phaser-genesis/src/config/SetConfigDefaults.ts
  function SetConfigDefaults() {
    SetBackgroundColor(0);
    SetBatchSize(2048);
    SetBanner("Phaser", "4.0.0", "https://phaser4.io");
    SetMaxTextures(0);
    SetDefaultOrigin(0.5, 0.5);
    SetSize(800, 600, 1);
    SetWebGLContext({
      antialias: true,
      desynchronized: true,
      preserveDrawingBuffer: true
    });
  }

  // ../phaser-genesis/src/components/timer/Time.ts
  var Time = class {
    lastTick = 0;
    elapsed = 0;
    delta = 0;
    fps = 60;
    fpsCount = 0;
    frame = 0;
    ms = 0;
    prevFrame = 0;
    constructor() {
      const now = performance.now();
      this.lastTick = now;
      this.prevFrame = now;
    }
    update(time) {
      this.ms = time - this.lastTick;
    }
    updateDelta(time) {
      const now = performance.now();
      const elapsed2 = now - time;
      this.fpsCount++;
      if (now >= this.prevFrame + 1e3) {
        this.fps = this.fpsCount * 1e3 / (now - this.prevFrame);
        this.prevFrame = now;
        this.fpsCount = 0;
      }
      this.lastTick = now;
      this.elapsed += elapsed2;
      this.delta = 1e3 / this.fps;
      this.frame++;
      GameInstance.setFrame(this.frame);
      RenderStats.fps = this.fps;
      RenderStats.delta = 1e3 / this.fps;
      return this.frame;
    }
    resetLastTick() {
      this.lastTick = performance.now();
    }
  };

  // ../phaser-genesis/src/Game.ts
  var Game = class extends EventEmitter {
    id = addEntity(GameObjectWorld);
    time;
    isBooted = false;
    isPaused = false;
    willUpdate = true;
    willRender = true;
    renderStats;
    constructor(...settings) {
      super();
      this.time = new Time();
      GameInstance.set(this);
      SetConfigDefaults();
      DOMContentLoaded(() => this.boot(settings));
    }
    boot(settings) {
      settings.forEach((setting) => setting());
      CreateRenderer();
      CreateTextureManager();
      CreateSceneManager();
      AddBanner();
      AddGlobalVar(this);
      AddToParent();
      this.isBooted = true;
      this.renderStats = CreateWorldRenderData();
      Emit(this, "boot");
      requestAnimationFrame((now) => this.step(now));
    }
    pause() {
      this.isPaused = true;
    }
    resume() {
      this.isPaused = false;
      this.time.resetLastTick();
    }
    update(delta, time) {
    }
    render(renderPass, delta, time) {
    }
    step(now) {
      const renderer = RendererInstance.get();
      const sceneManager = SceneManagerInstance.get();
      const time = this.time;
      ResetWorldRenderData(this.renderStats, time.frame);
      time.update(now);
      if (!this.isPaused) {
        const delta = time.delta;
        if (this.willUpdate) {
          sceneManager.update();
          this.update(delta, now);
          Emit(this, "update", delta, now);
        }
        if (this.willRender) {
          sceneManager.preRender();
          renderer.begin(sceneManager.flush);
          const renderPass = renderer.renderPass;
          sceneManager.render(renderPass);
          this.render(renderPass, delta, now);
          Emit(this, "render", renderPass, delta, now);
          renderer.end();
        }
      }
      time.updateDelta(now);
      Emit(this, "step");
      this.renderStats.fps = time.fps;
      this.renderStats.delta = time.delta;
      requestAnimationFrame((now2) => this.step(now2));
    }
    destroy() {
    }
  };

  // ../phaser-genesis/src/input/keyboard/Keyboard.ts
  var Keyboard = class extends EventEmitter {
    keys;
    keydownHandler;
    keyupHandler;
    blurHandler;
    keyConversion = {
      Up: "ArrowUp",
      Down: "ArrowDown",
      Left: "ArrowLeft",
      Right: "ArrowRight",
      Spacebar: " ",
      Win: "Meta",
      Scroll: "ScrollLock",
      Del: "Delete",
      Apps: "ContextMenu",
      Esc: "Escape",
      Add: "+",
      Subtract: "-",
      Multiply: "*",
      Decimal: ".",
      Divide: "/"
    };
    constructor() {
      super();
      this.keydownHandler = (event) => this.onKeyDown(event);
      this.keyupHandler = (event) => this.onKeyUp(event);
      this.blurHandler = () => this.onBlur();
      window.addEventListener("keydown", this.keydownHandler);
      window.addEventListener("keyup", this.keyupHandler);
      window.addEventListener("blur", this.blurHandler);
      this.keys = new Map();
    }
    addKeys(...keys) {
      keys.forEach((key) => {
        this.keys.set(key.getValue(), key);
      });
    }
    clearKeys() {
      this.keys.clear();
    }
    onBlur() {
      this.keys.forEach((key) => {
        key.reset();
      });
    }
    getKeyValue(key) {
      if (this.keyConversion.hasOwnProperty(key)) {
        return this.keyConversion[key];
      } else {
        return key;
      }
    }
    onKeyDown(event) {
      const value = this.getKeyValue(event.key);
      if (this.keys.has(value)) {
        const key = this.keys.get(value);
        key.down(event);
      }
      Emit(this, "keydown-" + value, event);
      Emit(this, "keydown", event);
    }
    onKeyUp(event) {
      const value = this.getKeyValue(event.key);
      if (this.keys.has(value)) {
        const key = this.keys.get(value);
        key.up(event);
      }
      Emit(this, "keyup-" + value, event);
      Emit(this, "keyup", event);
    }
    destroy() {
      window.removeEventListener("keydown", this.keydownHandler);
      window.removeEventListener("keyup", this.keyupHandler);
      window.removeEventListener("blur", this.blurHandler);
      Emit(this, "destroy");
    }
  };

  // ../phaser-genesis/src/loader/CreateFile.ts
  function CreateFile(key, url, skipCache = false) {
    return {
      key,
      url,
      skipCache
    };
  }

  // ../phaser-genesis/src/loader/IsAbsoluteURI.ts
  function IsAbsoluteURI(url) {
    return /^(?:blob:|data:|http:\/\/|https:\/\/|\/\/)/.test(url);
  }

  // ../phaser-genesis/src/loader/GetURL.ts
  function GetURL(key, url, extension, loader) {
    if (!url) {
      url = `${key}.${extension}`;
    }
    if (IsAbsoluteURI(url)) {
      return url;
    } else if (loader) {
      return `${loader.baseURL}${loader.path}${url}`;
    } else {
      return url;
    }
  }

  // ../phaser-genesis/src/loader/RequestFile.ts
  async function RequestFile(file, preload, onload, fileData) {
    if (!preload(file)) {
      return Promise.reject(file);
    }
    try {
      const request = new Request(file.url, fileData?.requestInit);
      file.response = await fetch(request);
      if (file.response.ok && await onload(file)) {
        return Promise.resolve(file);
      } else {
        return Promise.reject(file);
      }
    } catch (error) {
      file.error = error;
      return Promise.reject(file);
    }
  }

  // ../phaser-genesis/src/loader/files/ImageFile.ts
  function ImageFile(key, url, fileData = {}) {
    return (loader) => {
      const file = CreateFile(key, GetURL(key, url, "png", loader), fileData?.skipCache);
      const textureManager = TextureManagerInstance.get();
      const preload = () => {
        return textureManager && (!textureManager.has(key) || !textureManager.get(key).locked);
      };
      const onload = async (file2) => {
        const blob = await file2.response.blob();
        let image;
        if (window && "createImageBitmap" in window && !fileData?.getImage) {
          image = await createImageBitmap(blob);
        } else {
          image = await new Promise((resolve, reject) => {
            const url2 = URL.createObjectURL(blob);
            const img = new Image();
            img.onload = () => {
              URL.revokeObjectURL(url2);
              resolve(img);
            };
            img.onerror = () => {
              reject();
            };
            img.src = url2;
            if (img.complete && img.width && img.height) {
              img.onload = null;
              img.onerror = null;
              resolve(img);
            }
          });
        }
        if (!image) {
          return false;
        }
        if (fileData.skipCache) {
          file2.data = image;
        } else if (textureManager.has(key)) {
          file2.data = textureManager.update(key, image, fileData?.glConfig);
        } else {
          file2.data = textureManager.add(key, image, fileData?.glConfig);
        }
        return true;
      };
      return RequestFile(file, preload, onload, fileData);
    };
  }

  // ../phaser-genesis/src/cache/Cache.ts
  var caches = new Map();
  var Cache = {
    get: (type) => {
      if (!caches.has(type)) {
        caches.set(type, new Map());
      }
      return caches.get(type);
    },
    getEntry: (cache, entry) => {
      if (caches.has(cache)) {
        return caches.get(cache).get(entry);
      }
    }
  };

  // ../phaser-genesis/src/loader/files/JSONFile.ts
  function JSONFile(key, url, fileData = {}) {
    return (loader) => {
      const file = CreateFile(key, GetURL(key, url, "json", loader), fileData.skipCache);
      const cache = Cache.get("JSON");
      const preload = (file2) => {
        return cache && (!cache.has(key) || !file2.skipCache);
      };
      const onload = async (file2) => {
        file2.data = await file2.response.json();
        if (!file2.skipCache) {
          cache.set(key, file2.data);
        }
        return true;
      };
      return RequestFile(file, preload, onload, fileData);
    };
  }

  // ../phaser-genesis/src/loader/files/AtlasFile.ts
  function AtlasFile(key, textureURL, atlasURL, fileData = {}) {
    return async (loader) => {
      try {
        const loadImage = ImageFile(key, textureURL, Object.assign({}, fileData, { skipCache: false }));
        const loadJSON = JSONFile(key, atlasURL, Object.assign({}, fileData, { skipCache: true }));
        const image = await loadImage(loader);
        const json = await loadJSON(loader);
        AtlasParser(GetTexture(key), json.data);
        return Promise.resolve(image);
      } catch (error) {
        return Promise.reject();
      }
    };
  }

  // ../phaser-genesis/src/loader/files/LoadAtlasFile.ts
  async function LoadAtlasFile(key, textureURL, atlasURL, fileData = {}) {
    const load = AtlasFile(key, textureURL, atlasURL, fileData);
    return load();
  }

  // ../phaser-genesis/src/loader/files/LoadImageFile.ts
  async function LoadImageFile(key, url, fileData = {}) {
    const load = ImageFile(key, url, fileData);
    return load();
  }

  // ../phaser-genesis/src/input/mouse/Mouse.ts
  var Mouse = class extends EventEmitter {
    primaryDown = false;
    auxDown = false;
    secondaryDown = false;
    blockContextMenu = true;
    localPoint;
    hitPoint;
    target;
    resolution = 1;
    mousedownHandler;
    mouseupHandler;
    mousemoveHandler;
    mousewheelHandler;
    contextmenuHandler;
    blurHandler;
    transPoint;
    constructor(target) {
      super();
      this.mousedownHandler = (event) => this.onMouseDown(event);
      this.mouseupHandler = (event) => this.onMouseUp(event);
      this.mousemoveHandler = (event) => this.onMouseMove(event);
      this.mousewheelHandler = (event) => this.onMouseWheel(event);
      this.contextmenuHandler = (event) => this.onContextMenuEvent(event);
      this.blurHandler = () => this.onBlur();
      this.localPoint = new Vec2();
      this.hitPoint = new Vec2();
      this.transPoint = new Vec2();
      if (!target) {
        target = RendererInstance.get().canvas;
      }
      target.addEventListener("mousedown", this.mousedownHandler);
      target.addEventListener("mouseup", this.mouseupHandler);
      target.addEventListener("wheel", this.mousewheelHandler, { passive: false });
      target.addEventListener("contextmenu", this.contextmenuHandler);
      window.addEventListener("mouseup", this.mouseupHandler);
      window.addEventListener("mousemove", this.mousemoveHandler);
      window.addEventListener("blur", this.blurHandler);
      this.target = target;
    }
    onBlur() {
    }
    onMouseDown(event) {
      this.positionToPoint(event);
      this.primaryDown = event.button === 0;
      this.auxDown = event.button === 1;
      this.secondaryDown = event.button === 2;
      Emit(this, "pointerdown", this.localPoint.x, this.localPoint.y, event.button, event);
    }
    onMouseUp(event) {
      this.positionToPoint(event);
      this.primaryDown = !(event.button === 0);
      this.auxDown = !(event.button === 1);
      this.secondaryDown = !(event.button === 2);
      Emit(this, "pointerup", this.localPoint.x, this.localPoint.y, event.button, event);
    }
    onMouseMove(event) {
      this.positionToPoint(event);
      Emit(this, "pointermove", this.localPoint.x, this.localPoint.y, event);
    }
    onMouseWheel(event) {
      Emit(this, "wheel", event.deltaX, event.deltaY, event.deltaZ, event);
    }
    onContextMenuEvent(event) {
      if (this.blockContextMenu) {
        event.preventDefault();
      }
      Emit(this, "contextmenu", event);
    }
    positionToPoint(event) {
      return this.localPoint.set(event.offsetX, event.offsetY);
    }
    getInteractiveChildren(parent, results) {
      const children = parent.children;
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (!child.visible || !child.input.enabled) {
          continue;
        }
        results.push(child);
        if (child.input.enabledChildren && child.numChildren) {
          this.getInteractiveChildren(child, results);
        }
      }
    }
    checkHitArea(entity, px, py) {
      if (entity.input.hitArea) {
        if (entity.input.hitArea.contains(px, py)) {
          return true;
        }
      } else {
        return entity.transformExtent.contains(px, py);
      }
      return false;
    }
    hitTest(...entities) {
      const localX = this.localPoint.x;
      const localY = this.localPoint.y;
      const point = this.transPoint;
      for (let i = 0; i < entities.length; i++) {
        const entity = entities[i];
        if (!entity.world) {
          continue;
        }
        const mat = Mat2dAppend(entity.world.camera.worldTransform, entity.worldTransform);
        Mat2dGlobalToLocal(mat, localX, localY, point);
        if (this.checkHitArea(entity, point.x, point.y)) {
          this.hitPoint.set(point.x, point.y);
          return true;
        }
      }
      return false;
    }
    hitTestChildren(parent, topOnly = true) {
      const output = [];
      if (!parent.visible) {
        return output;
      }
      const candidates = [];
      const parentInput = parent.input;
      if (parentInput && parentInput.enabled) {
        candidates.push(parent);
      }
      if (parentInput.enabledChildren && parent.numChildren) {
        this.getInteractiveChildren(parent, candidates);
      }
      for (let i = candidates.length - 1; i >= 0; i--) {
        const entity = candidates[i];
        if (this.hitTest(entity)) {
          output.push(entity);
          if (topOnly) {
            break;
          }
        }
      }
      return output;
    }
    shutdown() {
      const target = this.target;
      target.removeEventListener("mousedown", this.mousedownHandler);
      target.removeEventListener("mouseup", this.mouseupHandler);
      target.removeEventListener("wheel", this.mousewheelHandler);
      target.removeEventListener("contextmenu", this.contextmenuHandler);
      window.removeEventListener("mouseup", this.mouseupHandler);
      window.removeEventListener("mousemove", this.mousemoveHandler);
      window.removeEventListener("blur", this.blurHandler);
    }
  };

  // ../phaser-genesis/src/animation/Play.ts
  function Play(animation, config = {}, ...sprites) {
    const data = CreateAnimData(animation.key, animation.frameRate, animation.duration, animation.delay, animation.repeat, animation.repeatDelay, animation.yoyo, animation.hold, animation.showOnStart, animation.hideOnComplete);
    Object.assign(data, config);
    data.nextFrameTime = animation.msPerFrame + data.delay;
    sprites.forEach((sprite) => {
      if (!sprite || !sprite.animData) {
        return;
      }
      const spriteAnimData = sprite.animData;
      if (spriteAnimData.isPlaying) {
        if (sprite.currentAnimation !== animation) {
          spriteAnimData.isPlaying = false;
          if (spriteAnimData.onComplete) {
            spriteAnimData.onComplete(sprite, sprite.currentAnimation);
          }
        } else if (!data.forceRestart) {
          return;
        }
      }
      Object.assign(spriteAnimData, data);
      sprite.currentAnimation = animation;
      sprite.currentFrame = animation.firstFrame;
      sprite.play();
    });
    return sprites;
  }

  // ../phaser-genesis/src/gameobjects/text/SetBackgroundStyle.ts
  function SetBackgroundStyle(style, cornerRadius, ...text) {
    text.forEach((entity) => {
      entity.backgroundStyle = style;
      if (cornerRadius !== null) {
        entity.cornerRadius = cornerRadius;
      }
      entity.updateText();
    });
  }

  // ../phaser-genesis/src/gameobjects/text/SetLineSpacing.ts
  function SetLineSpacing(spacing, ...text) {
    text.forEach((entity) => {
      entity.lineSpacing = spacing;
      entity.updateText();
    });
  }

  // ../phaser-genesis/src/gameobjects/text/SetPadding.ts
  function SetPadding(left, right, top, bottom, ...text) {
    text.forEach((entity) => {
      const padding = entity.padding;
      padding.left = left;
      padding.right = right;
      padding.top = top;
      padding.bottom = bottom;
      entity.updateText();
    });
  }

  // examples/live/libs/stats.js
  function Stats(game2, t = 0) {
    var game2 = game2;
    var mode = 0;
    var container = document.createElement("div");
    container.style.cssText = "position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000";
    container.addEventListener("click", function(event) {
      event.preventDefault();
      showPanel(++mode % container.children.length);
    }, false);
    function addPanel(panel) {
      container.appendChild(panel.dom);
      return panel;
    }
    function showPanel(id) {
      for (var i = 0; i < container.children.length; i++) {
        container.children[i].style.display = i === id ? "block" : "none";
      }
      mode = id;
    }
    var beginTime = (performance || Date).now(), prevTime = beginTime, frames = 0;
    var fpsPanel = addPanel(new Stats.Panel("FPS", "#0ff", "#002"));
    var renderMsPanel = addPanel(new Stats.Panel("MS RENDER", "#0f0", "#020"));
    var updateMsPanel = addPanel(new Stats.Panel("MS UPDATE", "#f08", "#201"));
    showPanel(t);
    return {
      dom: container,
      addPanel,
      showPanel,
      begin: function() {
        beginTime = performance.now();
      },
      end: function() {
        var time = performance.now();
        if (time >= prevTime + 250) {
          fpsPanel.update(game2.renderStats.fps, 100);
          renderMsPanel.update(game2.renderStats.renderMs, 200);
          updateMsPanel.update(game2.renderStats.updateMs, 200);
          prevTime = time;
        }
        return time;
      },
      update: function() {
        beginTime = this.end();
      }
    };
  }
  Stats.Panel = function(name, fg, bg) {
    var min = Infinity, max = 0, round = Math.round;
    var PR = round(window.devicePixelRatio || 1);
    var WIDTH = 120;
    var HEIGHT = 48;
    var TEXT_X = 3 * PR;
    var TEXT_Y = 3 * PR;
    var GRAPH_X = 3 * PR;
    var GRAPH_Y = 15 * PR;
    var GRAPH_WIDTH = (WIDTH - 6) * PR;
    var GRAPH_HEIGHT = (HEIGHT - 18) * PR;
    var canvas = document.createElement("canvas");
    canvas.style.cssText = `width:${WIDTH}px;height:${HEIGHT}px`;
    WIDTH *= PR;
    HEIGHT *= PR;
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    var context = canvas.getContext("2d");
    context.font = "bold " + 9 * PR + "px Helvetica,Arial,sans-serif";
    context.textBaseline = "top";
    context.fillStyle = bg;
    context.fillRect(0, 0, WIDTH, HEIGHT);
    context.fillStyle = fg;
    context.fillText(name, TEXT_X, TEXT_Y);
    context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);
    context.fillStyle = bg;
    context.globalAlpha = 0.9;
    context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);
    return {
      dom: canvas,
      update: function(value, maxValue) {
        min = Math.min(min, value);
        max = Math.max(max, value);
        context.fillStyle = bg;
        context.globalAlpha = 1;
        context.fillRect(0, 0, WIDTH, GRAPH_Y);
        context.fillStyle = fg;
        context.fillText(round(value) + " " + name + " (" + round(min) + "-" + round(max) + ")", TEXT_X, TEXT_Y);
        context.drawImage(canvas, GRAPH_X + PR, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT, GRAPH_X, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT);
        context.fillRect(GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, GRAPH_HEIGHT);
        context.fillStyle = bg;
        context.globalAlpha = 0.9;
        context.fillRect(GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, round((1 - value / maxValue) * GRAPH_HEIGHT));
      }
    };
  };
  function StartStats(game2, t = 0) {
    const stats = new Stats(game2, t);
    document.body.appendChild(stats.dom);
    function animate() {
      stats.update();
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }

  // ../phaser-genesis/src/world/events/WorldAfterUpdateEvent.ts
  var WorldAfterUpdateEvent = "afterupdate";

  // ../phaser-genesis/src/world/events/WorldBeforeUpdateEvent.ts
  var WorldBeforeUpdateEvent = "beforeupdate";

  // ../phaser-genesis/src/world/events/WorldPostRenderEvent.ts
  var WorldPostRenderEvent = "worldpostrender";

  // ../phaser-genesis/src/world/events/WorldPreRenderEvent.ts
  var WorldPreRenderEvent = "worldprerender";

  // ../phaser-genesis/src/world/events/WorldRenderEvent.ts
  var WorldRenderEvent = "worldrender";

  // ../phaser-genesis/src/world/events/WorldShutdownEvent.ts
  var WorldShutdownEvent = "worldshutdown";

  // ../phaser-genesis/src/world/events/WorldUpdateEvent.ts
  var WorldUpdateEvent = "update";

  // ../phaser-genesis/src/scenes/events/SceneDestroyEvent.ts
  var SceneDestroyEvent = "destroy";

  // ../phaser-genesis/src/world/UpdateWorld.ts
  function UpdateWorld(world2, delta, time) {
    if (!WillUpdate(world2.id)) {
      return;
    }
    const start = performance.now();
    let next = GetFirstChildID(world2.id);
    let total2 = 0;
    while (next > 0) {
      if (WillUpdate(next)) {
        GameObjectCache.get(next).update(delta, time);
        total2++;
      }
      next = MoveNextUpdatable(next);
    }
    world2.renderData.updated = total2;
    world2.renderData.updateMs = performance.now() - start;
    Emit(world2, WorldUpdateEvent, delta, time);
  }

  // ../phaser-genesis/src/world/BaseWorld.ts
  var BaseWorld = class extends GameObject {
    type = "BaseWorld";
    tag = defineComponent();
    scene;
    camera;
    is3D = false;
    updateDisplayList = true;
    color;
    renderData;
    stack;
    totalChildren = 0;
    totalChildrenQuery;
    constructor(scene) {
      super();
      const id = this.id;
      const tag = this.tag;
      this.scene = scene;
      this.totalChildrenQuery = defineQuery([tag]);
      SetWorldID(id, id);
      WorldList.get(scene).push(this);
      this.color = new Color(id);
      this.events = new Map();
      this.renderData = CreateWorldRenderData();
      this.stack = new Uint32Array(256);
      SetWillTransformChildren(id, false);
      SetWillCacheChildren(id, false);
      Once(scene, SceneDestroyEvent, () => this.destroy());
    }
    getNumChildren() {
      if (this.updateDisplayList) {
        this.totalChildren = this.totalChildrenQuery(GameObjectWorld).length;
        this.updateDisplayList = false;
      }
      return this.totalChildren;
    }
    beforeUpdate(delta, time) {
      ResetWorldRenderData(this.renderData);
      Emit(this, WorldBeforeUpdateEvent, delta, time, this);
    }
    update(delta, time) {
      UpdateWorld(this, delta, time);
    }
    afterUpdate(delta, time) {
      Emit(this, WorldAfterUpdateEvent, delta, time, this);
    }
    preRender(gameFrame) {
      return true;
    }
    renderGL(renderPass) {
    }
    shutdown() {
      RemoveChildren(this);
      Emit(this, WorldShutdownEvent, this);
    }
    destroy(reparentChildren) {
      super.destroy(reparentChildren);
      this.shutdown();
      if (this.camera) {
        this.camera.destroy();
      }
      this.camera = null;
    }
  };

  // ../phaser-genesis/src/world/RenderGLNode.ts
  var RENDER_LIST = [];
  var RENDER_CHILD_TOTAL = 0;
  var PROCESS_TOTAL = 0;
  function GetRenderList() {
    return RENDER_LIST;
  }
  function GetRenderChildTotal() {
    return RENDER_CHILD_TOTAL;
  }
  function GetProcessTotal() {
    return PROCESS_TOTAL;
  }
  function ResetRenderChildTotal() {
    RENDER_CHILD_TOTAL = 0;
    PROCESS_TOTAL = 0;
    RENDER_LIST.length = 0;
  }
  function RenderGLNode(renderPass, id) {
    const inView = IsInView(id) || WillCacheChildren(id);
    let gameObject;
    PROCESS_TOTAL++;
    if (inView) {
      gameObject = GameObjectCache.get(id);
      gameObject.renderGL(renderPass);
      RENDER_CHILD_TOTAL++;
    }
    if (HasCustomDisplayList(id)) {
      gameObject = GameObjectCache.get(id);
      gameObject.renderGL(renderPass);
      RENDER_CHILD_TOTAL++;
      const children = gameObject.getChildren(renderPass);
      const numChildren = children.length;
      for (let i = 0; i < numChildren; i++) {
        const childGameObject = children[i];
        const childID = childGameObject.id;
        PROCESS_TOTAL++;
        if (WillRender(childID)) {
          if (GetNumChildren(childID)) {
            RenderGLNode(renderPass, childID);
          } else {
            childGameObject.renderGL(renderPass);
            childGameObject.postRenderGL(renderPass);
            RENDER_CHILD_TOTAL++;
          }
        }
      }
      gameObject.postRenderGL(renderPass);
    } else {
      const numChildren = HasRenderableChildren(id, renderPass.isCameraDirty());
      if (numChildren) {
        let childID = GetFirstChildID(id);
        for (let i = 0; i < numChildren; i++) {
          PROCESS_TOTAL++;
          if (WillRender(childID)) {
            if (GetNumChildren(childID)) {
              RenderGLNode(renderPass, childID);
            } else if (IsInView(childID)) {
              const childGameObject = GameObjectCache.get(childID);
              childGameObject.renderGL(renderPass);
              childGameObject.postRenderGL(renderPass);
              RENDER_CHILD_TOTAL++;
            }
          }
          childID = GetNextSiblingID(childID);
        }
      }
    }
    if (inView) {
      gameObject.postRenderGL(renderPass);
    }
    ClearDirtyChildTransform(id);
    ClearDirtyWorldTransform(id);
  }

  // ../phaser-genesis/src/world/ProcessNode.ts
  function ProcessNode(node, cameraUpdated, isDisplayList) {
    if (isDisplayList) {
      return HasDirtyDisplayList(node);
    } else if (HasChildren(node) && (cameraUpdated || WillUpdateTransform(node))) {
      return true;
    }
    return false;
  }

  // ../phaser-genesis/src/world/UpdateNode.ts
  function UpdateNode(id, parentID, checkColor, checkTransform, cx, cy, cright, cbottom, forceUpdate, parentIsDisplayList, renderData) {
    renderData.dirtyQuad++;
    if (checkColor && HasDirtyColor(id)) {
      const r = ColorComponent.r[id] / 255;
      const g = ColorComponent.g[id] / 255;
      const b = ColorComponent.b[id] / 255;
      const a = ColorComponent.a[id];
      SetQuadColor(id, r, g, b, a);
      ClearDirtyColor(id);
      renderData.dirtyColor++;
    }
    if (checkTransform) {
      let hasUpdated = false;
      if (HasDirtyTransform(id)) {
        UpdateTransforms(id, cx, cy, cright, cbottom, forceUpdate, parentIsDisplayList);
        hasUpdated = true;
        renderData.dirtyLocal++;
      } else if (HasDirtyWorldTransform(parentID)) {
        UpdateWorldTransform(id, parentID, cx, cy, cright, cbottom, forceUpdate, parentIsDisplayList);
        hasUpdated = true;
        renderData.dirtyWorld++;
      } else if (forceUpdate) {
        SetInViewFromBounds(id, cx, cy, cright, cbottom);
        renderData.dirtyView++;
      }
      if (hasUpdated && parentIsDisplayList) {
        GameObjectCache.get(parentID).onUpdateChild(id);
      }
    }
  }

  // ../phaser-genesis/src/world/PreRenderWorld.ts
  function PreRenderWorld(world2, gameFrame) {
    const start = performance.now();
    const id = world2.id;
    const renderData = world2.renderData;
    renderData.gameFrame = gameFrame;
    const camera = world2.camera;
    const cameraUpdated = camera.updateBounds();
    Emit(world2, WorldPreRenderEvent, world2);
    const checkColor = HasDirtyChildColor(id);
    const checkTransform = HasDirtyChildTransform(id) || cameraUpdated;
    if (!checkColor && !checkTransform) {
      return false;
    }
    const cx = camera.getBoundsX();
    const cy = camera.getBoundsY();
    const cright = camera.getBoundsRight();
    const cbottom = camera.getBoundsBottom();
    const stack = world2.stack;
    stack[0] = id;
    let stackIndex = 1;
    let parentNode = id;
    let node = GetFirstChildID(id);
    let isDisplayList = HasCustomDisplayList(node);
    stackBlock: {
      while (stackIndex > 0) {
        UpdateNode(node, parentNode, checkColor, checkTransform, cx, cy, cright, cbottom, cameraUpdated, isDisplayList, renderData);
        while (ProcessNode(node, cameraUpdated, isDisplayList)) {
          stack[stackIndex++] = node;
          parentNode = node;
          isDisplayList = HasCustomDisplayList(node);
          node = GetFirstChildID(node);
          UpdateNode(node, parentNode, checkColor, checkTransform, cx, cy, cright, cbottom, cameraUpdated, isDisplayList, renderData);
        }
        let next = GetNextSiblingID(node);
        let climb = true;
        while (next && climb) {
          if (ProcessNode(next, cameraUpdated, isDisplayList)) {
            climb = false;
            break;
          } else {
            UpdateNode(next, parentNode, checkColor, checkTransform, cx, cy, cright, cbottom, cameraUpdated, isDisplayList, renderData);
            next = GetNextSiblingID(next);
          }
        }
        if (climb) {
          while (next === 0) {
            node = stack[--stackIndex];
            if (!node) {
              break stackBlock;
            }
            next = GetNextSiblingID(node);
          }
          parentNode = stack[stackIndex - 1];
          isDisplayList = HasCustomDisplayList(parentNode);
        }
        node = next;
      }
    }
    ClearDirtyChildColor(id);
    ClearDirtyChildTransform(id);
    world2.getNumChildren();
    renderData.preRenderMs = performance.now() - start;
    return true;
  }

  // ../phaser-genesis/src/renderer/webgl1/renderpass/SetCamera.ts
  function SetCamera(renderPass, camera) {
    if (renderPass.current2DCamera !== camera) {
      Flush(renderPass);
      renderPass.current2DCamera = camera;
      renderPass.cameraMatrix = camera.getMatrix();
    }
    if (camera.update()) {
      renderPass.getCurrentShader().bind(renderPass);
    }
  }

  // ../phaser-genesis/src/renderer/webgl1/renderpass/Begin.ts
  function Begin(renderPass, camera) {
    renderPass.shader.bindDefault();
    SetCamera(renderPass, camera);
  }

  // ../phaser-genesis/src/world/RenderGLWorld.ts
  function RenderGLWorld(world2, renderPass) {
    SetColor(renderPass, world2.color);
    Emit(world2, WorldRenderEvent, world2);
    const camera = world2.camera;
    const renderData = world2.renderData;
    const start = performance.now();
    Begin(renderPass, camera);
    ResetRenderChildTotal();
    let id = GetFirstChildID(world2.id);
    while (id > 0) {
      if (WillRender(id)) {
        RenderGLNode(renderPass, id);
      }
      id = GetNextSiblingID(id);
    }
    PopColor(renderPass, world2.color);
    renderData.renderMs = performance.now() - start;
    renderData.numChildren = world2.getNumChildren();
    renderData.rendered = GetRenderChildTotal();
    renderData.processed = GetProcessTotal();
    const gameStats = world2.scene.game.renderStats;
    gameStats.rendered += renderData.rendered;
    gameStats.dirtyColor += renderData.dirtyColor;
    gameStats.dirtyLocal += renderData.dirtyLocal;
    gameStats.dirtyView += renderData.dirtyView;
    gameStats.dirtyWorld += renderData.dirtyWorld;
    gameStats.dirtyQuad += renderData.dirtyQuad;
    gameStats.processed += renderData.processed;
    gameStats.renderMs += renderData.renderMs;
    gameStats.numChildren = renderData.numChildren;
    gameStats.preRenderMs += renderData.preRenderMs;
    gameStats.updated += renderData.updated;
    gameStats.updateMs += renderData.updateMs;
    Emit(world2, WorldPostRenderEvent, renderPass, world2);
  }

  // ../phaser-genesis/src/camera/WorldCamera.ts
  var WorldCamera = class {
    id = addEntity(GameObjectWorld);
    type = "WorldCamera";
    name = "";
    size;
    position;
    matrix;
    _data;
    constructor(width, height) {
      const id = this.id;
      AddTransform2DComponent(id);
      this.matrix = new Matrix4();
      this.position = new Position(id, 0, 0);
      this.size = new Size(id, width, height);
      this._data = Transform2DComponent.data[id];
      this.reset(width, height);
    }
    set x(value) {
      this.position.x = value;
    }
    get x() {
      return this.position.x;
    }
    set y(value) {
      this.position.y = value;
    }
    get y() {
      return this.position.y;
    }
    setPosition(x, y) {
      this.position.set(x, y);
      return this;
    }
    updateBounds() {
      const id = this.id;
      if (HasDirtyTransform(id)) {
        const x = this.x;
        const y = this.y;
        const w = this.size.width;
        const h = this.size.height;
        const ox = -x + w / 2;
        const oy = -y + h / 2;
        const bx = ox - w / 2;
        const by = oy - h / 2;
        SetBounds(id, bx, by, bx + w, by + h);
        return true;
      }
      return false;
    }
    update() {
      const id = this.id;
      if (HasDirtyTransform(id)) {
        const data = this.matrix.data;
        data[12] = this.x;
        data[13] = this.y;
        ClearDirtyTransform(id);
        return true;
      }
      return true;
    }
    getBoundsX() {
      return this._data[TRANSFORM.BOUNDS_X1];
    }
    getBoundsY() {
      return this._data[TRANSFORM.BOUNDS_Y1];
    }
    getBoundsRight() {
      return this._data[TRANSFORM.BOUNDS_X2];
    }
    getBoundsBottom() {
      return this._data[TRANSFORM.BOUNDS_Y2];
    }
    getMatrix() {
      return this.matrix.data;
    }
    reset(width, height) {
      this.size.set(width, height);
    }
    destroy() {
      const id = this.id;
      removeComponent(GameObjectWorld, Transform2DComponent, id);
      removeEntity(GameObjectWorld, id);
    }
  };

  // ../phaser-genesis/src/world/World.ts
  var World = class extends BaseWorld {
    type = "World";
    constructor(scene) {
      super(scene);
      const renderer = RendererInstance.get();
      this.camera = new WorldCamera(renderer.width, renderer.height);
    }
    preRender(gameFrame) {
      return PreRenderWorld(this, gameFrame);
    }
    renderGL(renderPass) {
      RenderGLWorld(this, renderPass);
    }
    getRenderList() {
      return GetRenderList();
    }
  };

  // examples/src/camera/performance test.ts
  var worldWidth = 512;
  var worldHeight = 512;
  var gridSize = 512;
  var gridWidth = 0;
  var Fireball = class extends AnimatedSprite {
    constructor(fireballAnimation) {
      super(Between(0, worldWidth), Between(0, worldHeight), "fireball");
      this.speedX = Between(1, 8);
      this.speedY = Between(1, 8);
      this.rotation = Math.PI - Math.atan2(this.speedY, this.speedX);
      Play(fireballAnimation, { repeat: -1, frameRate: 1 }, this);
    }
    update(delta, now) {
      super.update(delta, now);
      this.x -= this.speedX;
      this.y += this.speedY;
      if (this.x < 0) {
        this.x = worldWidth;
      }
      if (this.y > worldHeight) {
        this.y = 0;
      }
    }
  };
  var Demo = class extends Scene {
    constructor() {
      super();
      this.cameraSpeed = 16;
      const keyboard = new Keyboard();
      this.leftKey = new LeftKey();
      this.rightKey = new RightKey();
      this.upKey = new UpKey();
      this.downKey = new DownKey();
      keyboard.addKeys(this.leftKey, this.rightKey, this.upKey, this.downKey);
      this.create();
    }
    async create() {
      await LoadAtlasFile("items", "assets/land.png", "assets/land.json");
      await LoadImageFile("grass", "assets/textures/grass-plain.png");
      await LoadAtlasFile("fireball", "assets/fireball.png", "assets/fireball.json");
      await LoadImageFile("32", "assets/32x32.png");
      await LoadImageFile("322", "assets/drawcursor.png");
      const world2 = new World(this);
      this.grassLayer = new SpatialGridLayer(256, 256, false);
      this.itemsLayer = new SpatialGridLayer(256, 256, false);
      this.itemsLayer.onSortChildren = (a, b) => {
        return a.y - b.y;
      };
      AddChild(world2, this.grassLayer);
      AddChild(world2, this.itemsLayer);
      this.world = world2;
      this.camera = this.world.camera;
      this.texture = GetTexture("items");
      this.fireballAnimation = CreateAnimationFromAtlas({ key: "fire", texture: "fireball", prefix: "trail_", start: 0, end: 12, zeroPad: 2 });
      this.addGrid();
      this.stats = new Text(0, 0, "Click to expand the World\nCursors to scroll").setOrigin(0, 0);
      SetPadding(8, 8, 8, 8, this.stats);
      SetLineSpacing(20, this.stats);
      SetBackgroundStyle("rgba(0, 0, 150, 0.8)", 6, this.stats);
      AddChild(world2, this.stats);
      const mouse = new Mouse();
      On(mouse, "pointerdown", () => {
        if (window["game"].renderStats.numChildren > 2e6) {
          return;
        }
        this.addGrid();
      });
      On(world2, "worldprerender", () => {
        this.stats.x = this.camera.getBoundsX() + 16;
        this.stats.y = this.camera.getBoundsBottom() - 108;
      });
      this.camera.setPosition(0, 50);
      StartStats(this.game);
    }
    addGrid() {
      const startX = gridWidth * gridSize;
      const startY = gridWidth * gridSize;
      gridWidth++;
      for (let i = 0; i < gridWidth; i++) {
        this.addLand(startX, gridSize * i);
      }
      for (let i = 0; i < gridWidth - 1; i++) {
        this.addLand(gridSize * i, startY);
      }
      for (let i = 0; i < gridWidth * 8; i++) {
        const fireball = new Fireball(this.fireballAnimation);
        AddChild(this.world, fireball);
      }
      worldWidth += 512;
      worldHeight += 512;
    }
    addLand(wx, wy) {
      AddChild(this.grassLayer, new Sprite(wx, wy, "grass").setOrigin(0, 0));
      const frames = Array.from(this.texture.frames.keys());
      frames.shift();
      for (let y = 0; y < 12; y++) {
        for (let x = 0; x < 12; x++) {
          const frame2 = GetRandom(frames);
          const rx = Between(wx + 16, wx + 498);
          const ry = Between(wy + 16, wy + 498);
          AddChild(this.itemsLayer, new Sprite(rx, ry, "items", frame2).setOrigin(0.5, 1).setScale(0.35, 0.35));
        }
      }
    }
    update() {
      if (!this.camera) {
        return;
      }
      if (this.leftKey.isDown) {
        this.camera.x += this.cameraSpeed;
      } else if (this.rightKey.isDown) {
        this.camera.x -= this.cameraSpeed;
      }
      if (this.upKey.isDown) {
        this.camera.y += this.cameraSpeed;
      } else if (this.downKey.isDown) {
        this.camera.y -= this.cameraSpeed;
      }
      const total2 = window["game"].renderStats.numChildren;
      this.stats.setText([
        "Click to expand the World",
        `World size: ${worldWidth} x ${worldHeight}`,
        `Total sprites: ${total2}`
      ]);
    }
  };
  var params = new URLSearchParams(document.location.search);
  var total = parseInt(params.get("t"));
  if (!total || total === 0) {
    total = 16;
  }
  var game = new Game(WebGL(), BatchSize(4096), Parent("gameParent"), GlobalVar("Phaser4"), BackgroundColor(657930), Scenes(Demo));
  window["game"] = game;
})();
/**
 * @author       Richard Davey <rich@photonstorm.com>
 * @copyright    2020 Photon Storm Ltd.
 * @license      {@link https://opensource.org/licenses/MIT|MIT License}
 */
//# sourceMappingURL=performance test.js.map
