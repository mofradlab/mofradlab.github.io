const molstarViewers = new Map();
const molstarInitPromises = new WeakMap();
const MOLSTAR_INTERSECTION_ROOT_MARGIN = '300px 0px';

function normalizeStructureSource(source) {
  if (!source) return null;
  return new URL(source, window.location.origin).toString();
}

function colorStringToHex(colorValue) {
  const color = colorValue.trim();

  if (color.startsWith('#')) {
    const normalized = color.length === 4
      ? color.slice(1).split('').map((char) => char + char).join('')
      : color.slice(1);
    return parseInt(normalized, 16);
  }

  const rgbMatch = color.match(/\d+/g);
  if (!rgbMatch || rgbMatch.length < 3) return 0xffffff;

  const [red, green, blue] = rgbMatch.slice(0, 3).map(Number);
  return (red << 16) + (green << 8) + blue;
}

function getSurfaceColorString() {
  const rootStyles = getComputedStyle(document.documentElement);
  return rootStyles.getPropertyValue('--surface-0').trim() || '#ffffff';
}

function getMolstarBackgroundColor() {
  return colorStringToHex(getSurfaceColorString());
}

function applyViewerBackground(viewer) {
  const canvas3d = viewer?.plugin?.canvas3d;
  if (!canvas3d) return;

  canvas3d.setProps({
    renderer: {
      backgroundColor: getMolstarBackgroundColor(),
    },
  });

  if (typeof canvas3d.requestDraw === 'function') {
    canvas3d.requestDraw(true);
  }
}

async function loadViewerStructure(viewer, config) {
  if (config.source && config.format) {
    try {
      await viewer.loadStructureFromUrl(
        normalizeStructureSource(config.source),
        config.format,
        false,
        { label: config.title }
      );
      return;
    } catch (error) {
      if (!config.pdb_id) throw error;
      console.warn('Local Mol* structure load failed, falling back to PDB ID.', error);
    }
  }

  if (config.pdb_id) {
    await viewer.loadPdb(config.pdb_id);
    return;
  }

  throw new Error('Mol* viewer configuration is incomplete.');
}

async function initializeMolstar(block) {
  if (molstarInitPromises.has(block)) {
    return molstarInitPromises.get(block);
  }

  const configNode = block.querySelector('.molstar-config');
  const root = block.querySelector('[data-molstar-root]');
  const status = block.querySelector('[data-molstar-status]');
  const poster = block.querySelector('[data-molstar-poster]');

  if (!configNode || !root || !status) return Promise.resolve();

  if (!window.molstar?.Viewer?.create) {
    if (poster) poster.hidden = false;
    status.hidden = false;
    status.textContent = 'Mol* failed to load, so the poster preview is being shown instead.';
    return Promise.resolve();
  }

  const config = JSON.parse(configNode.textContent);

  const initialization = (async () => {
    try {
      const viewer = await window.molstar.Viewer.create(root, {
        layoutIsExpanded: false,
        layoutShowControls: false,
        layoutShowRemoteState: false,
        layoutShowSequence: false,
        layoutShowLog: false,
        layoutShowLeftPanel: false,
        collapseLeftPanel: true,
        viewportShowControls: false,
        viewportShowExpand: false,
        viewportShowSelectionMode: false,
        viewportShowAnimation: false,
        viewportShowReset: false,
        viewportShowSettings: false,
        viewportShowScreenshotControls: false,
        viewportShowToggleFullscreen: false,
        viewportShowTrajectoryControls: false,
        viewportBackgroundColor: getSurfaceColorString(),
        pdbProvider: 'rcsb',
        emdbProvider: 'rcsb',
      });

      molstarViewers.set(block, viewer);
      await loadViewerStructure(viewer, config);
      applyViewerBackground(viewer);

      block.classList.add('is-loaded');
      status.hidden = true;
      if (poster) poster.hidden = true;
    } catch (error) {
      console.error('Mol* initialization failed:', error);
      if (poster) poster.hidden = false;
      status.hidden = false;
      status.textContent = 'Mol* could not be initialized, so the poster preview is being shown instead.';
    }
  })();

  molstarInitPromises.set(block, initialization);
  return initialization;
}

function initializeMolstarWhenVisible(block, observer) {
  initializeMolstar(block).finally(() => {
    if (observer) observer.unobserve(block);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const blocks = document.querySelectorAll('.js-molstar-viewer');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        initializeMolstarWhenVisible(entry.target, observer);
      });
    }, { rootMargin: MOLSTAR_INTERSECTION_ROOT_MARGIN });

    blocks.forEach((block) => observer.observe(block));
    return;
  }

  blocks.forEach((block) => {
    initializeMolstarWhenVisible(block);
  });
});

window.addEventListener('themeChanged', () => {
  molstarViewers.forEach((viewer) => applyViewerBackground(viewer));
});
