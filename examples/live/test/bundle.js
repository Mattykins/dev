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
    WORLD_SIZE: "WorldSize"
  };

  // ../phaser-genesis/src/config/ConfigStore.ts
  var ConfigStore = new Map();

  // ../phaser-genesis/src/config/backgroundcolor/SetBackgroundColor.ts
  function SetBackgroundColor(color) {
    ConfigStore.set(CONFIG_DEFAULTS.BACKGROUND_COLOR, color);
  }

  // ../phaser-genesis/src/config/banner/SetBanner.ts
  function SetBanner(title = "", version = "", url = "", color = "#fff", background = "linear-gradient(#3e0081 40%, #00bcc3)") {
    ConfigStore.set(CONFIG_DEFAULTS.BANNER, { title, version, url, color, background });
  }

  // ../phaser-genesis/src/config/batchsize/SetBatchSize.ts
  function SetBatchSize(size) {
    ConfigStore.set(CONFIG_DEFAULTS.BATCH_SIZE, size);
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

  // ../phaser-genesis/src/math/mat4/Mat4Ortho.ts
  function Mat4Ortho(left, right, bottom, top, near, far, out = new Matrix4()) {
    const lr = 1 / (left - right);
    const bt = 1 / (bottom - top);
    const nf = 1 / (near - far);
    return out.set(-2 * lr, 0, 0, 0, 0, -2 * bt, 0, 0, 0, 0, 2 * nf, 0, (left + right) * lr, (top + bottom) * bt, (far + near) * nf, 1);
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
    const total = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < total; i++) {
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

  // ../phaser-genesis/node_modules/bitecs/dist/index.es.js
  var TYPES_ENUM = {
    i8: "i8",
    ui8: "ui8",
    ui8c: "ui8c",
    i16: "i16",
    ui16: "ui16",
    i32: "i32",
    ui32: "ui32",
    f32: "f32",
    f64: "f64"
  };
  var TYPES_NAMES = {
    i8: "Int8",
    ui8: "Uint8",
    ui8c: "Uint8Clamped",
    i16: "Int16",
    ui16: "Uint16",
    i32: "Int32",
    ui32: "Uint32",
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
    f64: Float64Array
  };
  var UNSIGNED_MAX = {
    uint8: 2 ** 8,
    uint16: 2 ** 16,
    uint32: 2 ** 32
  };
  var $storeRef = Symbol("storeRef");
  var $storeSize = Symbol("storeSize");
  var $storeMaps = Symbol("storeMaps");
  var $storeFlattened = Symbol("storeFlattened");
  var $storeBase = Symbol("storeBase");
  var $storeType = Symbol("storeType");
  var $storeArrayCounts = Symbol("storeArrayCount");
  var $storeSubarrays = Symbol("storeSubarrays");
  var $storeCursor = Symbol("storeCursor");
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
  var stores = {};
  var resize = (ta, size) => {
    const newBuffer = new ArrayBuffer(size * ta.BYTES_PER_ELEMENT);
    const newTa = new ta.constructor(newBuffer);
    newTa.set(ta, 0);
    return newTa;
  };
  var createShadow = (store, key) => {
    if (!ArrayBuffer.isView(store)) {
      const shadow = store[$parentArray].slice(0).fill(0);
      for (const k in store[key]) {
        const from = store[key][k][$subarrayFrom];
        const to = store[key][k][$subarrayTo];
        store[key][k] = shadow.subarray(from, to);
      }
    } else {
      store[key] = store.slice(0).fill(0);
    }
  };
  var resizeSubarray = (metadata, store, size) => {
    const cursors = metadata[$subarrayCursors];
    const type = store[$storeType];
    const length = store[0].length;
    const indexType = length <= UNSIGNED_MAX.uint8 ? "ui8" : length <= UNSIGNED_MAX.uint16 ? "ui16" : "ui32";
    const arrayCount = metadata[$storeArrayCounts][type];
    const summedLength = Array(arrayCount).fill(0).reduce((a, p) => a + length, 0);
    const array = new TYPES[type](summedLength * size);
    array.set(metadata[$storeSubarrays][type]);
    metadata[$storeSubarrays][type] = array;
    createShadow(metadata[$storeSubarrays][type], $queryShadow);
    createShadow(metadata[$storeSubarrays][type], $serializeShadow);
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
      store[eid][$queryShadow] = metadata[$storeSubarrays][type][$queryShadow].subarray(from, to);
      store[eid][$serializeShadow] = metadata[$storeSubarrays][type][$serializeShadow].subarray(from, to);
      store[eid][$subarray] = true;
      store[eid][$indexType] = array[$indexType];
      store[eid][$indexBytes] = array[$indexBytes];
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
        store[key][$queryShadow] = resize(ta[$queryShadow], size);
        store[key][$serializeShadow] = resize(ta[$serializeShadow], size);
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
    return new TYPES[type](buffer);
  };
  var createArrayStore = (metadata, type, length) => {
    const size = metadata[$storeSize];
    const store = Array(size).fill(0);
    store[$storeType] = type;
    const cursors = metadata[$subarrayCursors];
    const indexType = length < UNSIGNED_MAX.uint8 ? "ui8" : length < UNSIGNED_MAX.uint16 ? "ui16" : "ui32";
    if (!length)
      throw new Error("\u274C Must define a length for component array.");
    if (!TYPES[type])
      throw new Error(`\u274C Invalid component array property type ${type}.`);
    if (!metadata[$storeSubarrays][type]) {
      const arrayCount = metadata[$storeArrayCounts][type];
      const summedLength = Array(arrayCount).fill(0).reduce((a, p) => a + length, 0);
      const array = new TYPES[type](summedLength * size);
      metadata[$storeSubarrays][type] = array;
      createShadow(metadata[$storeSubarrays][type], $queryShadow);
      createShadow(metadata[$storeSubarrays][type], $serializeShadow);
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
      store[eid][$queryShadow] = metadata[$storeSubarrays][type][$queryShadow].subarray(from, to);
      store[eid][$serializeShadow] = metadata[$storeSubarrays][type][$serializeShadow].subarray(from, to);
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
      [$storeCursor]: 0,
      [$subarrayCursors]: Object.keys(TYPES).reduce((a, type) => ({
        ...a,
        [type]: 0
      }), {}),
      [$storeFlattened]: [],
      [$storeArrayCounts]: arrayCounts
    };
    if (schema instanceof Object && Object.keys(schema).length) {
      const recursiveTransform = (a, k) => {
        if (typeof a[k] === "string") {
          a[k] = createTypeStore(a[k], size);
          createShadow(a[k], $queryShadow);
          createShadow(a[k], $serializeShadow);
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
  var resized = false;
  var setSerializationResized = (v) => {
    resized = v;
  };
  var newEntities = new Map();
  var $entityMasks = Symbol("entityMasks");
  var $entityComponents = Symbol("entityMasks");
  var $entitySparseSet = Symbol("entitySparseSet");
  var $entityArray = Symbol("entityArray");
  var defaultSize = 1e5;
  var globalEntityCursor = 0;
  var globalSize = defaultSize;
  var resizeThreshold = () => globalSize - globalSize / 5;
  var getGlobalSize = () => globalSize;
  var removed = [];
  var getDefaultSize = () => defaultSize;
  var getEntityCursor = () => globalEntityCursor;
  var eidToWorld = new Map();
  var addEntity = (world2) => {
    const eid = removed.length > 0 ? removed.shift() : globalEntityCursor++;
    world2[$entitySparseSet].add(eid);
    eidToWorld.set(eid, world2);
    if (globalEntityCursor >= resizeThreshold()) {
      const size = globalSize;
      const amount = Math.ceil(size / 2 / 4) * 4;
      const newSize = size + amount;
      globalSize = newSize;
      resizeWorlds(newSize);
      resizeComponents(newSize);
      setSerializationResized(true);
      console.info(`\u{1F47E} bitECS - resizing all worlds from ${size} to ${size + amount}`);
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
  function Changed(c) {
    return function QueryChanged() {
      return c;
    };
  }
  var $queries = Symbol("queries");
  var $notQueries = Symbol("notQueries");
  var $queryMap = Symbol("queryMap");
  var $dirtyQueries = Symbol("$dirtyQueries");
  var $queryComponents = Symbol("queryComponents");
  var registerQuery = (world2, query) => {
    const components2 = [];
    const notComponents = [];
    const changedComponents = [];
    query[$queryComponents].forEach((c) => {
      if (typeof c === "function") {
        const comp = c();
        if (!world2[$componentMap].has(comp))
          registerComponent(world2, comp);
        if (c.name === "QueryNot") {
          notComponents.push(comp);
        }
        if (c.name === "QueryChanged") {
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
    const toRemove = [];
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
    const notMasks = notComponents.map(mapComponents).reduce((a, c) => {
      if (!a[c.generationId]) {
        a[c.generationId] = 0;
      }
      a[c.generationId] |= c.bitflag;
      return a;
    }, {});
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
    components2.map(mapComponents).forEach((c) => {
      c.queries.add(q);
    });
    notComponents.map(mapComponents).forEach((c) => {
      c.notQueries.add(q);
    });
    if (notComponents.length)
      world2[$notQueries].add(q);
    for (let eid = 0; eid < getEntityCursor(); eid++) {
      if (!world2[$entitySparseSet].has(eid))
        continue;
      if (queryCheckEntity(world2, q, eid)) {
        queryAddEntity(q, eid);
      }
    }
  };
  var diff = (q, clearDiff) => {
    if (clearDiff)
      q.changed.length = 0;
    const {
      flatProps,
      shadows
    } = q;
    for (let i = 0; i < q.dense.length; i++) {
      const eid = q.dense[i];
      let dirty = false;
      for (let pid = 0; pid < flatProps.length; pid++) {
        const prop = flatProps[pid];
        const shadow = shadows[pid];
        if (ArrayBuffer.isView(prop[eid])) {
          for (let i2 = 0; i2 < prop[eid].length; i2++) {
            if (prop[eid][i2] !== prop[eid][$queryShadow][i2]) {
              dirty = true;
              prop[eid][$queryShadow][i2] = prop[eid][i2];
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
  var defineQuery = (components2) => {
    if (components2 === void 0 || components2[$componentMap] !== void 0) {
      return (world2) => world2 ? world2[$entityArray] : components2[$entityArray];
    }
    const query = function(world2, clearDiff = true) {
      if (!world2[$queryMap].has(query))
        registerQuery(world2, query);
      const q = world2[$queryMap].get(query);
      queryCommitRemovals(q);
      if (q.changedComponents.length)
        return diff(q, clearDiff);
      return q.dense;
    };
    query[$queryComponents] = components2;
    return query;
  };
  var queryCheckEntity = (world2, q, eid) => {
    const {
      masks,
      notMasks,
      generations
    } = q;
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
    while (q.toRemove.length) {
      q.remove(q.toRemove.pop());
    }
  };
  var commitRemovals = (world2) => {
    world2[$dirtyQueries].forEach(queryCommitRemovals);
    world2[$dirtyQueries].clear();
  };
  var queryRemoveEntity = (world2, q, eid) => {
    if (!q.has(eid))
      return;
    q.toRemove.push(eid);
    world2[$dirtyQueries].add(q);
    q.exited.push(eid);
  };
  var $componentMap = Symbol("componentMap");
  var components = [];
  var resizeComponents = (size) => {
    components.forEach((component) => resizeStore(component, size));
  };
  var defineComponent = (schema) => {
    const component = createStore(schema, getDefaultSize());
    if (schema && Object.keys(schema).length)
      components.push(component);
    return component;
  };
  var incrementBitflag = (world2) => {
    world2[$bitflag] *= 2;
    if (world2[$bitflag] >= 2 ** 32) {
      world2[$bitflag] = 1;
      world2[$entityMasks].push(new Uint32Array(world2[$size]));
    }
  };
  var registerComponent = (world2, component) => {
    if (!component)
      throw new Error(`\u{1F47E} bitECS - cannot register component as it is null or undefined.`);
    const queries = new Set();
    const notQueries = new Set();
    world2[$queries].forEach((q) => {
      if (q.components.includes(component)) {
        queries.add(q);
      } else if (q.notComponents.includes(component)) {
        notQueries.add(q);
      }
    });
    world2[$componentMap].set(component, {
      generationId: world2[$entityMasks].length - 1,
      bitflag: world2[$bitflag],
      store: component,
      queries,
      notQueries
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
    const {
      generationId,
      bitflag
    } = registeredComponent;
    const mask = world2[$entityMasks][generationId][eid];
    return (mask & bitflag) === bitflag;
  };
  var addComponent = (world2, component, eid, reset = false) => {
    if (!Number.isInteger(eid)) {
      component = world2;
      world2 = eidToWorld.get(eid);
      reset = eid || reset;
    }
    if (!world2[$componentMap].has(component))
      registerComponent(world2, component);
    if (hasComponent(world2, component, eid))
      return;
    const c = world2[$componentMap].get(component);
    const {
      generationId,
      bitflag,
      queries,
      notQueries
    } = c;
    notQueries.forEach((q) => {
      const match = queryCheckEntity(world2, q, eid);
      if (match)
        queryRemoveEntity(world2, q, eid);
    });
    world2[$entityMasks][generationId][eid] |= bitflag;
    queries.forEach((q) => {
      const match = queryCheckEntity(world2, q, eid);
      if (match)
        queryAddEntity(q, eid);
    });
    world2[$entityComponents].get(eid).add(component);
    if (reset)
      resetStoreFor(component, eid);
  };
  var $size = Symbol("size");
  var $resizeThreshold = Symbol("resizeThreshold");
  var $bitflag = Symbol("bitflag");
  var $archetypes = Symbol("archetypes");
  var $localEntities = Symbol("localEntities");
  var worlds = [];
  var resizeWorlds = (size) => {
    worlds.forEach((world2) => {
      world2[$size] = size;
      for (let i = 0; i < world2[$entityMasks].length; i++) {
        const masks = world2[$entityMasks][i];
        world2[$entityMasks][i] = resize(masks, size);
      }
      world2[$resizeThreshold] = world2[$size] - world2[$size] / 5;
    });
  };
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
  var defineSystem = (fn1, fn2) => {
    const update = fn2 !== void 0 ? fn2 : fn1;
    const create = fn2 !== void 0 ? fn1 : void 0;
    const init = new Set();
    const system = (world2, ...args) => {
      if (create && !init.has(world2)) {
        create(world2, ...args);
        init.add(world2);
      }
      update(world2, ...args);
      commitRemovals(world2);
      return world2;
    };
    Object.defineProperty(system, "name", {
      value: (update.name || "AnonymousSystem") + "_internal",
      configurable: true
    });
    return system;
  };
  var Types = TYPES_ENUM;

  // ../phaser-genesis/src/components/transform/Extent2DComponent.ts
  var Extent2D = defineComponent({
    x: Types.f32,
    y: Types.f32,
    width: Types.f32,
    height: Types.f32,
    right: Types.f32,
    bottom: Types.f32
  });
  var Extent2DComponent = Extent2D;

  // ../phaser-genesis/src/components/dirty/DirtyComponent.ts
  var Dirty = defineComponent({
    child: Types.ui8,
    childCache: Types.ui8,
    displayList: Types.ui8,
    transform: Types.ui8
  });
  var DirtyComponent = Dirty;

  // ../phaser-genesis/src/components/dirty/SetDirtyTransform.ts
  function SetDirtyTransform(id) {
    DirtyComponent.transform[id] = 1;
  }

  // ../phaser-genesis/src/components/transform/SetExtent.ts
  function SetExtent(id, x, y, width, height) {
    Extent2DComponent.x[id] = x;
    Extent2DComponent.y[id] = y;
    Extent2DComponent.width[id] = width;
    Extent2DComponent.height[id] = height;
    Extent2DComponent.right[id] = x + width;
    Extent2DComponent.bottom[id] = y + height;
    SetDirtyTransform(id);
  }

  // ../phaser-genesis/src/components/vertices/QuadVertexComponent.ts
  var QuadVertex = defineComponent({
    values: [Types.f32, 54]
  });
  var QuadVertexComponent = QuadVertex;

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
      this.updateUVs();
    }
    setPivot(x, y) {
      this.pivot = { x, y };
    }
    setSize(width, height) {
      this.width = width;
      this.height = height;
      this.sourceSizeWidth = width;
      this.sourceSizeHeight = height;
      this.updateUVs();
    }
    setSourceSize(width, height) {
      this.sourceSizeWidth = width;
      this.sourceSizeHeight = height;
    }
    setTrim(width, height, x, y, w, h) {
      this.trimmed = true;
      this.sourceSizeWidth = width;
      this.sourceSizeHeight = height;
      this.spriteSourceSizeX = x;
      this.spriteSourceSizeY = y;
      this.spriteSourceSizeWidth = w;
      this.spriteSourceSizeHeight = h;
    }
    getExtent(originX, originY) {
      const sourceSizeWidth = this.sourceSizeWidth;
      const sourceSizeHeight = this.sourceSizeHeight;
      let left;
      let right;
      let top;
      let bottom;
      if (this.trimmed) {
        left = this.spriteSourceSizeX - originX * sourceSizeWidth;
        right = left + this.spriteSourceSizeWidth;
        top = this.spriteSourceSizeY - originY * sourceSizeHeight;
        bottom = top + this.spriteSourceSizeHeight;
      } else {
        left = -originX * sourceSizeWidth;
        right = left + sourceSizeWidth;
        top = -originY * sourceSizeHeight;
        bottom = top + sourceSizeHeight;
      }
      return { left, right, top, bottom };
    }
    copyToExtent(child) {
      const originX = child.origin.x;
      const originY = child.origin.y;
      const sourceSizeWidth = this.sourceSizeWidth;
      const sourceSizeHeight = this.sourceSizeHeight;
      let x;
      let y;
      let width;
      let height;
      if (this.trimmed) {
        x = this.spriteSourceSizeX - originX * sourceSizeWidth;
        y = this.spriteSourceSizeY - originY * sourceSizeHeight;
        width = this.spriteSourceSizeWidth;
        height = this.spriteSourceSizeHeight;
      } else {
        x = -originX * sourceSizeWidth;
        y = -originY * sourceSizeHeight;
        width = sourceSizeWidth;
        height = sourceSizeHeight;
      }
      SetExtent(child.id, x, y, width, height);
      return this;
    }
    copyToVertices(id) {
      SetUV(id, this.u0, this.v0, this.u1, this.v1);
      return this;
    }
    updateUVs() {
      const { x, y, width, height } = this;
      const baseTextureWidth = this.texture.width;
      const baseTextureHeight = this.texture.height;
      this.u0 = x / baseTextureWidth;
      this.v0 = y / baseTextureHeight;
      this.u1 = (x + width) / baseTextureWidth;
      this.v1 = (y + height) / baseTextureHeight;
    }
    destroy() {
      this.texture = null;
    }
  };

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
      frame2.setSize(width, height);
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
      uniforms.set("uProjectionMatrix", renderPass.projectionMatrix.data);
      uniforms.set("uCameraMatrix", renderPass.cameraMatrix.data);
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

  // ../phaser-genesis/src/GameInstance.ts
  var instance;
  var frame = 0;
  var elapsed = 0;
  var GameInstance = {
    get: () => {
      return instance;
    },
    set: (game) => {
      instance = game;
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

  // ../phaser-genesis/src/math/mat4/Mat4Identity.ts
  function Mat4Identity(matrix = new Matrix4()) {
    return matrix.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
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

  // ../phaser-genesis/src/camera/StaticCamera.ts
  var StaticCamera = class {
    world;
    matrix;
    renderer;
    type;
    width;
    height;
    bounds;
    dirtyRender;
    worldTransform;
    constructor() {
      this.dirtyRender = true;
      const game = GameInstance.get();
      this.renderer = game.renderer;
      this.matrix = Mat4Identity();
      this.bounds = new Rectangle();
      this.worldTransform = new Matrix2D();
      this.reset();
    }
    reset() {
      const renderer = this.renderer;
      if (renderer) {
        const width = renderer.width;
        const height = renderer.height;
        this.width = width;
        this.height = height;
      }
      this.bounds.set(0, 0, this.width, this.height);
    }
    destroy() {
      this.world = null;
      this.worldTransform = null;
      this.renderer = null;
      this.matrix = null;
      this.bounds = null;
    }
  };

  // ../phaser-genesis/src/renderer/webgl1/renderpass/CreateTempTextures.ts
  function CreateTempTextures() {
    let maxGPUTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
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
    bind(texture, index = 0) {
      const binding = texture.binding;
      binding.bind(index);
      gl.activeTexture(gl.TEXTURE0 + index);
      gl.bindTexture(gl.TEXTURE_2D, binding.texture);
    }
    unbind(index = 0) {
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
    }
    clear() {
      this.textures.forEach((texture) => texture.binding.unbind());
      this.textures.clear();
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
    quadBuffer;
    quadCamera;
    current2DCamera;
    constructor(renderer) {
      this.renderer = renderer;
      this.projectionMatrix = new Matrix4();
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
      this.quadCamera = new StaticCamera();
      this.textures.setDefault();
      this.framebuffer.setDefault();
      this.blendMode.setDefault(true, gl2.ONE, gl2.ONE_MINUS_SRC_ALPHA);
      this.colorMatrix.setDefault(DEFAULT_COLOR_MATRIX, DEFAULT_COLOR_OFFSET);
      this.vertexbuffer.setDefault(new VertexBuffer({ batchSize: GetBatchSize() }));
      this.shader.setDefault(GetMaxTextures() === 1 ? new QuadShader() : new MultiTextureQuadShader());
    }
    resize(width, height) {
      Mat4Ortho(0, width, height, 0, -1e3, 1e3, this.projectionMatrix);
      this.quadCamera.reset();
      this.viewport.setDefault(0, 0, width, height);
    }
  };

  // ../phaser-genesis/src/renderer/webgl1/renderpass/Start.ts
  function Start(renderPass) {
    renderPass.current2DCamera = renderPass.quadCamera;
    renderPass.cameraMatrix = renderPass.quadCamera.matrix;
    renderPass.count = 0;
    renderPass.flushTotal = 0;
    renderPass.framebuffer.bindDefault();
    renderPass.blendMode.bindDefault();
    renderPass.viewport.bindDefault();
    renderPass.vertexbuffer.bindDefault();
    renderPass.shader.bindDefault();
    renderPass.colorMatrix.bindDefault();
  }

  // ../phaser-genesis/src/renderer/webgl1/WebGLRendererInstance.ts
  var instance3;
  var WebGLRendererInstance = {
    get: () => {
      return instance3;
    },
    set: (renderer) => {
      instance3 = renderer;
    }
  };

  // ../phaser-genesis/src/world/WorldList.ts
  var WorldList = new Map();

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
    renderBegin(willRedraw) {
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
      Start(this.renderPass);
    }
    renderScenes(scenes) {
      const renderPass = this.renderPass;
      for (const scene of scenes.values()) {
        const worlds2 = WorldList.get(scene);
        for (const world2 of worlds2) {
          if (world2.runRender) {
            world2.renderGL(renderPass);
          }
          world2.postRenderGL(renderPass);
        }
      }
    }
    renderEnd() {
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

  // ../phaser-genesis/src/config/worldsize/SetWorldSize.ts
  function SetWorldSize(size) {
    ConfigStore.set(CONFIG_DEFAULTS.WORLD_SIZE, size);
  }

  // ../phaser-genesis/src/renderer/webgl1/draw/BatchQuad.ts
  function BatchQuad(F32, offset, textureIndex, x1, y1, x2, y2, x3, y3, x4, y4, r, g, b, a) {
    F32.set([
      x1,
      y1,
      0,
      0,
      textureIndex,
      r,
      g,
      b,
      a,
      x2,
      y2,
      0,
      1,
      textureIndex,
      r,
      g,
      b,
      a,
      x3,
      y3,
      1,
      1,
      textureIndex,
      r,
      g,
      b,
      a,
      x1,
      y1,
      0,
      0,
      textureIndex,
      r,
      g,
      b,
      a,
      x3,
      y3,
      1,
      1,
      textureIndex,
      r,
      g,
      b,
      a,
      x4,
      y4,
      1,
      0,
      textureIndex,
      r,
      g,
      b,
      a
    ], offset);
    return offset + 54;
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

  // ../phaser-genesis/src/renderer/webgl1/draw/FillRect.ts
  function FillRect(renderPass, x, y, width, height, red, green, blue, alpha) {
    const { F32, offset } = GetVertexBufferEntry(renderPass, 2);
    const textureIndex = renderPass.textures.setWhite();
    x = Math.round(x);
    y = Math.round(y);
    BatchQuad(F32, offset, textureIndex, x, y, x, y + height, x + width, y + height, x + width, y, red, green, blue, alpha);
  }

  // ../phaser-genesis/src/dom/AddToDOM.ts
  function AddToDOM(element, parent) {
    const target = GetElement(parent);
    target.appendChild(element);
    return element;
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

  // ../phaser-genesis/src/events/EventEmitter.ts
  var EventEmitter = class {
    events;
    constructor() {
      this.events = new Map();
    }
  };

  // ../phaser-genesis/src/GameObjectWorld.ts
  var world = createWorld();
  var GameObjectWorld = world;

  // ../phaser-genesis/src/config/banner/GetBanner.ts
  function GetBanner() {
    const { title, version, url, color, background } = ConfigStore.get(CONFIG_DEFAULTS.BANNER);
    if (title !== "") {
      const str = version !== "" ? title + " " + version : title;
      console.log(`%c${str}%c ${url}`, `padding: 4px 16px; color: ${color}; background: ${background}`, "");
    }
  }

  // ../phaser-genesis/src/config/globalvar/GetGlobalVar.ts
  function GetGlobalVar() {
    return ConfigStore.get(CONFIG_DEFAULTS.GLOBAL_VAR);
  }

  // ../phaser-genesis/src/config/parent/GetParent.ts
  function GetParent() {
    return ConfigStore.get(CONFIG_DEFAULTS.PARENT);
  }

  // ../phaser-genesis/src/scenes/RenderStatsComponent.ts
  var RenderStats = defineComponent({
    gameFrame: Types.ui32,
    numScenes: Types.ui8,
    numWorlds: Types.ui8,
    numGameObjects: Types.ui32,
    numGameObjectsRendered: Types.ui32,
    numDirtyLocalTransforms: Types.ui32,
    numDirtyWorldTransforms: Types.ui32,
    numDirtyVertices: Types.ui32,
    numDirtyWorldLists: Types.ui8,
    numDirtyCameras: Types.ui32
  });
  var RenderStatsComponent = RenderStats;

  // ../phaser-genesis/src/scenes/SceneManagerInstance.ts
  var instance4;
  var SceneManagerInstance = {
    get: () => {
      return instance4;
    },
    set: (manager) => {
      if (instance4) {
        throw new Error("SceneManager should not be instantiated more than once");
      }
      instance4 = manager;
    }
  };

  // ../phaser-genesis/src/scenes/GetRenderStatsAsObject.ts
  function GetRenderStatsAsObject(obj) {
    const id = SceneManagerInstance.get().id;
    if (!obj) {
      obj = { fps: 0, delta: 0, gameFrame: 0, numScenes: 0, numWorlds: 0, numGameObjects: 0, numGameObjectsRendered: 0, numDirtyLocalTransforms: 0, numDirtyWorldTransforms: 0, numDirtyVertices: 0, numDirtyWorldLists: 0, numDirtyCameras: 0 };
    }
    obj.gameFrame = RenderStatsComponent.gameFrame[id];
    obj.numScenes = RenderStatsComponent.numScenes[id];
    obj.numWorlds = RenderStatsComponent.numWorlds[id];
    obj.numGameObjects = RenderStatsComponent.numGameObjects[id];
    obj.numGameObjectsRendered = RenderStatsComponent.numGameObjectsRendered[id];
    obj.numDirtyLocalTransforms = RenderStatsComponent.numDirtyLocalTransforms[id];
    obj.numDirtyWorldTransforms = RenderStatsComponent.numDirtyWorldTransforms[id];
    obj.numDirtyVertices = RenderStatsComponent.numDirtyVertices[id];
    obj.numDirtyWorldLists = RenderStatsComponent.numDirtyWorldLists[id];
    obj.numDirtyCameras = RenderStatsComponent.numDirtyCameras[id];
    return obj;
  }

  // ../phaser-genesis/src/config/renderer/GetRenderer.ts
  function GetRenderer() {
    return ConfigStore.get(CONFIG_DEFAULTS.RENDERER);
  }

  // ../phaser-genesis/src/components/color/ColorComponent.ts
  var Color = defineComponent({
    r: Types.ui8c,
    g: Types.ui8c,
    b: Types.ui8c,
    a: Types.f32,
    colorMatrix: [Types.f32, 16],
    colorOffset: [Types.f32, 4]
  });
  var ColorComponent = Color;

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

  // ../phaser-genesis/src/components/color/PackQuadColorsSystem.ts
  var changedColorQuery = defineQuery([Changed(ColorComponent), QuadVertexComponent]);
  var packQuadColorsSystem = defineSystem((world2) => {
    const entities = changedColorQuery(world2);
    for (let i = 0; i < entities.length; i++) {
      const id = entities[i];
      const r = ColorComponent.r[id] / 255;
      const g = ColorComponent.g[id] / 255;
      const b = ColorComponent.b[id] / 255;
      const a = ColorComponent.a[id];
      SetQuadColor(id, r, g, b, a);
    }
    return world2;
  });
  var PackQuadColorsSystem = packQuadColorsSystem;

  // ../phaser-genesis/src/scenes/AddRenderStatsComponent.ts
  function AddRenderStatsComponent(id) {
    addComponent(GameObjectWorld, RenderStatsComponent, id);
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

  // ../phaser-genesis/src/scenes/ResetRenderStats.ts
  function ResetRenderStats(id, gameFrame, scenes) {
    RenderStatsComponent.gameFrame[id] = gameFrame;
    RenderStatsComponent.numScenes[id] = scenes;
    RenderStatsComponent.numWorlds[id] = 0;
    RenderStatsComponent.numGameObjects[id] = 0;
    RenderStatsComponent.numGameObjectsRendered[id] = 0;
    RenderStatsComponent.numDirtyWorldLists[id] = 0;
    RenderStatsComponent.numDirtyVertices[id] = 0;
    RenderStatsComponent.numDirtyLocalTransforms[id] = 0;
    RenderStatsComponent.numDirtyWorldTransforms[id] = 0;
    RenderStatsComponent.numDirtyCameras[id] = 0;
  }

  // ../phaser-genesis/src/scenes/SceneManager.ts
  var SceneManager = class {
    id = addEntity(GameObjectWorld);
    game;
    scenes = new Map();
    sceneIndex = 0;
    flush;
    constructor() {
      this.game = GameInstance.get();
      SceneManagerInstance.set(this);
      AddRenderStatsComponent(this.id);
      Once(this.game, "boot", () => this.boot());
    }
    boot() {
      const scenes = GetScenes();
      if (scenes) {
        scenes.forEach((scene) => new scene());
      }
    }
    update(delta, time, gameFrame) {
      ResetRenderStats(this.id, gameFrame, this.scenes.size);
      for (const scene of this.scenes.values()) {
        const worlds2 = WorldList.get(scene);
        for (const world2 of worlds2) {
          world2.beforeUpdate(delta, time);
        }
        for (const world2 of worlds2) {
          world2.update(delta, time);
        }
        for (const world2 of worlds2) {
          world2.afterUpdate(delta, time);
        }
      }
    }
    preRender(gameFrame) {
      for (const scene of this.scenes.values()) {
        const worlds2 = WorldList.get(scene);
        for (const world2 of worlds2) {
          if (world2.preRender(gameFrame)) {
            this.flush = true;
          }
        }
      }
    }
    getRenderList() {
      let output = [];
      for (const scene of this.scenes.values()) {
        const worlds2 = WorldList.get(scene);
        for (const world2 of worlds2) {
          output = output.concat(world2.getRenderList());
        }
      }
      return output;
    }
    updateWorldStats(numGameObjects, numRendered, numDisplayLists, numWorldTransforms) {
      const id = this.id;
      RenderStatsComponent.numGameObjects[id] += numGameObjects;
      RenderStatsComponent.numGameObjectsRendered[id] += numRendered;
      RenderStatsComponent.numDirtyWorldLists[id] += numDisplayLists;
      RenderStatsComponent.numDirtyWorldTransforms[id] += numWorldTransforms;
    }
  };

  // ../phaser-genesis/src/config/SetConfigDefaults.ts
  function SetConfigDefaults() {
    SetBackgroundColor(0);
    SetBatchSize(4096);
    SetBanner("Phaser", "4.0.0", "https://phaser4.io");
    SetMaxTextures(0);
    SetDefaultOrigin(0.5, 0.5);
    SetSize(800, 600, 1);
    SetWebGLContext({
      antialias: true,
      desynchronized: true,
      preserveDrawingBuffer: true
    });
    SetWorldSize(512);
  }

  // ../phaser-genesis/src/textures/CreateCanvas.ts
  function CreateCanvas(width, height) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas.getContext("2d");
  }

  // ../phaser-genesis/src/textures/TextureManagerInstance.ts
  var instance5;
  var TextureManagerInstance = {
    get: () => {
      return instance5;
    },
    set: (manager) => {
      instance5 = manager;
    }
  };

  // ../phaser-genesis/src/textures/TextureManager.ts
  var TextureManager = class {
    textures;
    constructor() {
      if (TextureManagerInstance.get()) {
        throw new Error("Only 1 instance of TextureManager allowed");
      }
      this.textures = new Map();
      this.createDefaultTextures();
      TextureManagerInstance.set(this);
    }
    createDefaultTextures() {
      this.add("__BLANK", new Texture(CreateCanvas(32, 32).canvas));
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

  // ../phaser-genesis/src/Game.ts
  var Game = class extends EventEmitter {
    id = addEntity(GameObjectWorld);
    VERSION = "4.0.0-beta1";
    isBooted = false;
    isPaused = false;
    willUpdate = true;
    willRender = true;
    lastTick = 0;
    elapsed = 0;
    delta = 0;
    fps = 0;
    frame = 0;
    framems = 0;
    frames = 0;
    prevFrame = 0;
    renderStats;
    renderer;
    textureManager;
    sceneManager;
    constructor(...settings) {
      super();
      GameInstance.set(this);
      SetConfigDefaults();
      DOMContentLoaded(() => this.boot(settings));
    }
    boot(settings) {
      settings.forEach((setting) => setting());
      const renderer = GetRenderer();
      this.textureManager = new TextureManager();
      this.renderer = new renderer();
      this.sceneManager = new SceneManager();
      const parent = GetParent();
      if (parent) {
        AddToDOM(this.renderer.canvas, parent);
      }
      const globalVar = GetGlobalVar();
      if (globalVar && window) {
        window[globalVar] = this;
      }
      this.isBooted = true;
      GetBanner();
      const now = performance.now();
      this.lastTick = now;
      this.prevFrame = now;
      this.renderStats = GetRenderStatsAsObject();
      Emit(this, "boot");
      requestAnimationFrame((now2) => this.step(now2));
    }
    pause() {
      this.isPaused = true;
    }
    resume() {
      this.isPaused = false;
      this.lastTick = performance.now();
    }
    update(delta, time) {
    }
    render(renderPass, delta, time) {
    }
    step(time) {
      const renderer = this.renderer;
      const sceneManager = this.sceneManager;
      const framems = time - this.lastTick;
      this.framems = framems;
      if (!this.isPaused) {
        if (this.willUpdate) {
          sceneManager.update(this.delta, time, this.frame);
          this.update(framems, time);
        }
        if (this.willRender) {
          renderer.renderBegin(sceneManager.flush);
          sceneManager.preRender(this.frame);
          renderer.renderScenes(sceneManager.scenes);
          PackQuadColorsSystem(GameObjectWorld);
          this.render(renderer.renderPass, framems, time);
          renderer.renderEnd();
          sceneManager.flush = false;
        }
      }
      const now = performance.now();
      const delta = now - time;
      this.frames++;
      if (now >= this.prevFrame + 1e3) {
        this.fps = this.frames * 1e3 / (now - this.prevFrame);
        this.prevFrame = now;
        this.frames = 0;
      }
      this.lastTick = now;
      this.elapsed += delta;
      this.delta = delta;
      GetRenderStatsAsObject(this.renderStats);
      this.renderStats.fps = this.fps;
      this.renderStats.delta = delta;
      Emit(this, "step");
      this.frame++;
      GameInstance.setFrame(this.frame);
      GameInstance.setElapsed(this.elapsed);
      requestAnimationFrame((now2) => this.step(now2));
    }
    destroy() {
    }
  };

  // ../phaser-genesis/src/color/GetColorFromRGB.ts
  function GetColorFromRGB(red, green, blue) {
    return red << 16 | green << 8 | blue;
  }

  // ../phaser-genesis/src/color/GetColorSpectrum.ts
  function GetColorSpectrum(limit = 1024) {
    const colors = [];
    const range = 255;
    let i;
    let r = 255;
    let g = 0;
    let b = 0;
    for (i = 0; i <= range; i++) {
      colors.push(GetColorFromRGB(r, i, b));
    }
    g = 255;
    for (i = range; i >= 0; i--) {
      colors.push(GetColorFromRGB(i, g, b));
    }
    r = 0;
    for (i = 0; i <= range; i++, g--) {
      colors.push(GetColorFromRGB(r, g, i));
    }
    g = 0;
    b = 255;
    for (i = 0; i <= range; i++, b--, r++) {
      colors.push(GetColorFromRGB(r, g, b));
    }
    if (limit === 1024) {
      return colors;
    } else {
      const out = [];
      let t = 0;
      const inc = 1024 / limit;
      for (i = 0; i < limit; i++) {
        out.push(colors[Math.floor(t)]);
        t += inc;
      }
      return out;
    }
  }

  // ../phaser-genesis/src/math/Wrap.ts
  function Wrap(value, min, max) {
    const range = max - min;
    return min + ((value - min) % range + range) % range;
  }

  // examples/src/test/bundle.ts
  var Test = class extends Game {
    colors;
    rgba;
    offset;
    constructor() {
      super(WebGL(), Parent("gameParent"), GlobalVar("Phaser4"));
      this.colors = GetColorSpectrum();
      this.offset = 0;
      this.rgba = [];
    }
    render(renderPass) {
      let f = 0;
      const rgba = this.rgba;
      const colors = this.colors;
      for (let y = 0; y < 600; y += 8) {
        f = Wrap(this.offset + y, 0, colors.length - 1);
        GetRGBArray(colors[Math.floor(f)], rgba);
        FillRect(renderPass, 0, y, 400, 8, rgba[0], rgba[1], rgba[2], rgba[3]);
        f = Wrap(this.offset - y, 0, colors.length - 1);
        GetRGBArray(colors[Math.floor(f)], rgba);
        FillRect(renderPass, 400, y, 400, 8, rgba[0], rgba[1], rgba[2], rgba[3]);
      }
      this.offset += 4;
    }
  };
  new Test();
})();
//# sourceMappingURL=bundle.js.map
