"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import * as topojson from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { Feature, Geometry, Position } from "geojson";

type City = {
  name: string;
  country: string;
  lat: number;
  lng: number;
  origin?: boolean;
};

type GlobeProps = {
  goldHex?: string;
  highlightHex?: string;
  deepHex?: string;
  rotationSpeed?: number;
  particles?: boolean;
  showLabels?: boolean;
};

const CITIES: City[] = [
  { name: "Laval",        country: "Canada",    lat:  45.6, lng:  -73.7, origin: true },
  { name: "Montréal",     country: "Canada",    lat:  45.5, lng:  -73.6 },
  { name: "Toronto",      country: "Canada",    lat:  43.7, lng:  -79.4 },
  { name: "New York",     country: "USA",       lat:  40.7, lng:  -74.0 },
  { name: "Miami",        country: "USA",       lat:  25.8, lng:  -80.2 },
  { name: "Los Angeles",  country: "USA",       lat:  34.0, lng: -118.2 },
  { name: "Mexico City",  country: "México",    lat:  19.4, lng:  -99.1 },
  { name: "Panama City",  country: "Panamá",    lat:   8.5, lng:  -79.5 },
  { name: "Bogotá",       country: "Colombia",  lat:   4.7, lng:  -74.1 },
  { name: "Lima",         country: "Perú",      lat: -12.0, lng:  -77.0 },
  { name: "São Paulo",    country: "Brasil",    lat: -23.5, lng:  -46.6 },
  { name: "Buenos Aires", country: "Argentina", lat: -34.6, lng:  -58.4 },
  { name: "London",       country: "UK",        lat:  51.5, lng:   -0.1 },
  { name: "Paris",        country: "France",    lat:  48.9, lng:    2.3 },
  { name: "Milan",        country: "Italia",    lat:  45.5, lng:    9.2 },
  { name: "Dubai",        country: "UAE",       lat:  25.3, lng:   55.3 },
  { name: "Singapore",    country: "Singapore", lat:   1.3, lng:  103.8 },
  { name: "Tokyo",        country: "Japan",     lat:  35.7, lng:  139.7 },
  { name: "Sydney",       country: "Australia", lat: -33.9, lng:  151.2 },
];

function pointInRing([x, y]: Position, ring: Position[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    if (((yi > y) !== (yj > y)) &&
        (x < (xj - xi) * (y - yi) / (yj - yi + 1e-12) + xi)) {
      inside = !inside;
    }
  }
  return inside;
}
function pointInPolygon(p: Position, polygon: Position[][]): boolean {
  if (!pointInRing(p, polygon[0])) return false;
  for (let k = 1; k < polygon.length; k++) {
    if (pointInRing(p, polygon[k])) return false;
  }
  return true;
}
function pointInGeometry(p: Position, geom: Geometry): boolean {
  if (geom.type === "Polygon") return pointInPolygon(p, geom.coordinates);
  if (geom.type === "MultiPolygon") {
    for (const poly of geom.coordinates) if (pointInPolygon(p, poly)) return true;
    return false;
  }
  return false;
}
function bboxOf(geom: Geometry): [number, number, number, number] {
  let minX = 181, maxX = -181, minY = 91, maxY = -91;
  const visit = (c: unknown): void => {
    if (Array.isArray(c) && typeof c[0] === "number" && typeof c[1] === "number") {
      if (c[0] < minX) minX = c[0] as number;
      if (c[0] > maxX) maxX = c[0] as number;
      if (c[1] < minY) minY = c[1] as number;
      if (c[1] > maxY) maxY = c[1] as number;
    } else if (Array.isArray(c)) {
      c.forEach(visit);
    }
  };
  if ("coordinates" in geom) visit(geom.coordinates);
  return [minX, minY, maxX, maxY];
}

function latLngTo3D(lat: number, lng: number, r = 1): THREE.Vector3 {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

export function Globe({
  goldHex = "#D4AF37",
  highlightHex = "#F2C85C",
  deepHex = "#5C4720",
  rotationSpeed = 0.16,
  particles = true,
  showLabels = true,
}: GlobeProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const labelLayerRef = useRef<HTMLDivElement | null>(null);
  const speedRef = useRef(rotationSpeed);

  const cities = useMemo(() => CITIES, []);

  useEffect(() => {
    speedRef.current = rotationSpeed;
  }, [rotationSpeed]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let width = mount.clientWidth;
    let height = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.05, 3.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const goldColor = new THREE.Color(goldHex);
    const highlight = new THREE.Color(highlightHex);
    const deepGold = new THREE.Color(deepHex);

    const earth = new THREE.Group();
    earth.rotation.z = (-23.5 * Math.PI) / 180;
    earth.rotation.x = 0.08;
    scene.add(earth);

    // Opaque core to occlude the far hemisphere.
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.985, 64, 48),
      new THREE.MeshBasicMaterial({ color: 0x000000, depthWrite: true })
    );
    core.renderOrder = 0;
    earth.add(core);

    let territory: THREE.Points | null = null;
    let territoryFadeStart = 0;
    let cancelled = false;

    fetch("https://unpkg.com/world-atlas@2.0.2/countries-110m.json")
      .then((r) => r.json())
      .then((topo: Topology) => {
        if (cancelled) return;
        const coll = topo.objects.countries as GeometryCollection;
        const features = (topojson.feature(topo, coll) as unknown as { features: Feature[] }).features;

        const STEP = 1.4;
        const positions: number[] = [];
        const seeds: number[] = [];

        features.forEach((feature) => {
          const geom = feature.geometry;
          if (!geom) return;
          const [minX, minY, maxX, maxY] = bboxOf(geom);
          const startLat = Math.max(-85, Math.floor(minY / STEP) * STEP);
          const endLat   = Math.min( 85, Math.ceil (maxY / STEP) * STEP);
          const startLng = Math.max(-179, Math.floor(minX / STEP) * STEP);
          const endLng   = Math.min( 179, Math.ceil (maxX / STEP) * STEP);

          for (let lat = startLat; lat <= endLat; lat += STEP) {
            for (let lng = startLng; lng <= endLng; lng += STEP) {
              if (pointInGeometry([lng, lat], geom)) {
                const jLat = lat + (Math.random() - 0.5) * STEP * 0.55;
                const jLng = lng + (Math.random() - 0.5) * STEP * 0.55;
                const v = latLngTo3D(jLat, jLng, 1.0);
                positions.push(v.x, v.y, v.z);
                seeds.push(Math.random());
              }
            }
          }
        });

        const tGeom = new THREE.BufferGeometry();
        tGeom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
        tGeom.setAttribute("seed", new THREE.Float32BufferAttribute(seeds, 1));

        const mat = new THREE.ShaderMaterial({
          uniforms: {
            uGold:       { value: goldColor },
            uHighlight:  { value: highlight },
            uDeep:       { value: deepGold },
            uOpacity:    { value: 0 },
            uPixelRatio: { value: Math.min(2, window.devicePixelRatio || 1) },
            uTime:       { value: 0 },
            uReveal:     { value: 0 },
          },
          vertexShader: `
            attribute float seed;
            varying float vDepth;
            varying float vSeed;
            varying float vLng;
            uniform float uPixelRatio;
            uniform float uTime;
            void main() {
              vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
              vDepth = -mvPos.z;
              vSeed = seed;
              vLng = atan(position.z, position.x);
              float twinkle = 1.0 + 0.18 * sin(uTime * 0.7 + seed * 12.566);
              gl_PointSize = (1.9 + 0.9 * seed) * uPixelRatio * (2.7 / -mvPos.z) * twinkle;
              gl_Position = projectionMatrix * mvPos;
            }
          `,
          fragmentShader: `
            uniform vec3 uGold;
            uniform vec3 uHighlight;
            uniform vec3 uDeep;
            uniform float uOpacity;
            uniform float uReveal;
            varying float vDepth;
            varying float vSeed;
            varying float vLng;
            void main() {
              vec2 c = gl_PointCoord - 0.5;
              float d = length(c);
              if (d > 0.5) discard;
              float a = smoothstep(0.5, 0.0, d);
              float front = clamp((4.4 - vDepth) / 2.0, 0.0, 1.0);
              float facing = smoothstep(0.32, 0.92, front);
              float initSweep = smoothstep(uReveal - 0.7, uReveal, vLng);
              float doneGate = smoothstep(3.05, 3.7, uReveal);
              float reveal = max(initSweep, doneGate);
              vec3 col = mix(uDeep, uGold, smoothstep(0.05, 0.35, front));
              col = mix(col, uHighlight, smoothstep(0.65, 1.0, front) * 0.75);
              float alpha = a * facing * reveal * uOpacity;
              if (alpha < 0.01) discard;
              gl_FragColor = vec4(col, alpha);
            }
          `,
          transparent: true,
          depthWrite: false,
          depthTest: true,
          blending: THREE.NormalBlending,
        });

        territory = new THREE.Points(tGeom, mat);
        earth.add(territory);
        territoryFadeStart = performance.now();
      })
      .catch(() => {});

    // Cities.
    const cityGold = new THREE.Color(highlightHex).lerp(new THREE.Color("#fff6d0"), 0.25);

    type CityNode = {
      city: City;
      pos: THREE.Vector3;
      dot: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
      halo: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
      ring1?: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
      ring2?: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
      sparks?: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;
      activation?: number;
      lastActivation?: number;
      shockStart?: number; // elapsed time when the burst was triggered
    };
    const cityNodes: CityNode[] = [];

    cities.forEach((city) => {
      const pos = latLngTo3D(city.lat, city.lng, 1.005);

      const dotGeom = new THREE.SphereGeometry(city.origin ? 0.022 : 0.014, 14, 14);
      const dotMat = new THREE.MeshBasicMaterial({ color: cityGold });
      if (!city.origin) {
        dotMat.transparent = true;
        dotMat.opacity = 0;
      }
      const dot = new THREE.Mesh(dotGeom, dotMat);
      dot.position.copy(pos);
      dot.renderOrder = 2;
      earth.add(dot);

      const haloMat = new THREE.MeshBasicMaterial({
        color: city.origin ? highlight : cityGold,
        transparent: true,
        opacity: city.origin ? 0.32 : 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const halo = new THREE.Mesh(
        new THREE.SphereGeometry(city.origin ? 0.06 : 0.045, 16, 16),
        haloMat
      );
      halo.position.copy(pos);
      halo.renderOrder = 1;
      earth.add(halo);

      // Premium landing burst — only for non-origin cities (Laval has its own
      // breathing pulse). Two flat rings + a small sparks system, all oriented
      // tangent to the globe surface.
      let ring1: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial> | undefined;
      let ring2: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial> | undefined;
      let sparks: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial> | undefined;

      if (!city.origin) {
        const orient = (mesh: THREE.Object3D) => {
          // Place the ring exactly on the surface, facing outward
          mesh.position.copy(pos).multiplyScalar(1.001);
          mesh.lookAt(pos.clone().multiplyScalar(2));
        };

        const ringMatA = new THREE.MeshBasicMaterial({
          color: highlight,
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide,
        });
        ring1 = new THREE.Mesh(
          new THREE.RingGeometry(0.018, 0.022, 48),
          ringMatA,
        );
        orient(ring1);
        ring1.renderOrder = 5;
        earth.add(ring1);

        const ringMatB = new THREE.MeshBasicMaterial({
          color: cityGold,
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide,
        });
        ring2 = new THREE.Mesh(
          new THREE.RingGeometry(0.024, 0.026, 48),
          ringMatB,
        );
        orient(ring2);
        ring2.renderOrder = 5;
        earth.add(ring2);

        // Sparks — 14 small additive points launched along the local tangent
        // plane and biased outward; lookup into uTime drives a tween.
        const SPARK_COUNT = 14;
        const sparkPos = new Float32Array(SPARK_COUNT * 3);
        const sparkDir = new Float32Array(SPARK_COUNT * 3);
        const sparkSeed = new Float32Array(SPARK_COUNT);
        // Build a tangent basis for this city's surface point
        const normal = pos.clone().normalize();
        const arbitrary = Math.abs(normal.y) < 0.9
          ? new THREE.Vector3(0, 1, 0)
          : new THREE.Vector3(1, 0, 0);
        const tangent = new THREE.Vector3()
          .crossVectors(normal, arbitrary)
          .normalize();
        const bitangent = new THREE.Vector3()
          .crossVectors(normal, tangent)
          .normalize();

        for (let i = 0; i < SPARK_COUNT; i++) {
          sparkPos[i * 3] = pos.x;
          sparkPos[i * 3 + 1] = pos.y;
          sparkPos[i * 3 + 2] = pos.z;
          const angle = (i / SPARK_COUNT) * Math.PI * 2 + Math.random() * 0.5;
          const radial = tangent
            .clone()
            .multiplyScalar(Math.cos(angle))
            .add(bitangent.clone().multiplyScalar(Math.sin(angle)));
          // Add a small outward kick
          const dir = radial
            .multiplyScalar(0.085 + Math.random() * 0.06)
            .add(normal.clone().multiplyScalar(0.04 + Math.random() * 0.03));
          sparkDir[i * 3] = dir.x;
          sparkDir[i * 3 + 1] = dir.y;
          sparkDir[i * 3 + 2] = dir.z;
          sparkSeed[i] = Math.random();
        }
        const sparkGeom = new THREE.BufferGeometry();
        sparkGeom.setAttribute("position", new THREE.BufferAttribute(sparkPos, 3));
        sparkGeom.setAttribute("aDir", new THREE.BufferAttribute(sparkDir, 3));
        sparkGeom.setAttribute("aSeed", new THREE.BufferAttribute(sparkSeed, 1));

        const sparkMat = new THREE.ShaderMaterial({
          uniforms: {
            uProgress:   { value: 0 },        // 0 → 1 over the burst lifetime
            uColor:      { value: new THREE.Color(highlightHex) },
            uPixelRatio: { value: Math.min(2, window.devicePixelRatio || 1) },
          },
          vertexShader: `
            attribute vec3 aDir;
            attribute float aSeed;
            uniform float uProgress;
            uniform float uPixelRatio;
            varying float vFade;
            varying float vSeed;
            void main() {
              vSeed = aSeed;
              float p = uProgress;
              // Easing: fast start, slow end
              float ease = 1.0 - pow(1.0 - p, 2.4);
              vec3 pos = position + aDir * ease * (1.6 + aSeed * 0.4);
              vec4 mv = modelViewMatrix * vec4(pos, 1.0);
              vFade = (1.0 - p) * (0.6 + aSeed * 0.4);
              gl_PointSize = (3.0 + 2.4 * aSeed) * uPixelRatio * (2.4 / -mv.z) * (0.4 + (1.0 - p) * 1.4);
              gl_Position = projectionMatrix * mv;
            }
          `,
          fragmentShader: `
            uniform vec3 uColor;
            varying float vFade;
            varying float vSeed;
            void main() {
              vec2 c = gl_PointCoord - 0.5;
              float d = length(c);
              if (d > 0.5) discard;
              float a = smoothstep(0.5, 0.0, d) * vFade;
              if (a < 0.01) discard;
              gl_FragColor = vec4(uColor, a);
            }
          `,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });
        sparks = new THREE.Points(sparkGeom, sparkMat);
        sparks.renderOrder = 6;
        sparks.frustumCulled = false;
        earth.add(sparks);
      }

      cityNodes.push({ city, pos, dot, halo, ring1, ring2, sparks });
    });

    // Connecting arcs from Laval to every other city.
    const origin = cities[0];
    const originPos = latLngTo3D(origin.lat, origin.lng, 1);

    type ArcEntry = {
      tube: THREE.Mesh<THREE.TubeGeometry, THREE.ShaderMaterial>;
      pulse: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
      curve: THREE.CatmullRomCurve3;
      index: number;
    };
    const arcs: ArcEntry[] = [];

    cities.slice(1).forEach((city, i) => {
      const target = latLngTo3D(city.lat, city.lng, 1);
      const distance = originPos.distanceTo(target);
      const lift = 0.12 + distance * 0.18;

      const segments = 80;
      const points: THREE.Vector3[] = [];
      for (let j = 0; j <= segments; j++) {
        const t = j / segments;
        const p = new THREE.Vector3().copy(originPos).lerp(target, t);
        const elev = 1 + Math.sin(t * Math.PI) * lift;
        p.normalize().multiplyScalar(elev);
        points.push(p);
      }

      const curve = new THREE.CatmullRomCurve3(points);
      const tubeSegments = 96;
      const tubeGeom = new THREE.TubeGeometry(curve, tubeSegments, 0.0019, 8, false);
      const posAttr = tubeGeom.attributes.position;
      const us = new Float32Array(posAttr.count);
      for (let v = 0; v < posAttr.count; v++) {
        us[v] = Math.floor(v / 9) / tubeSegments;
      }
      tubeGeom.setAttribute("aU", new THREE.BufferAttribute(us, 1));

      const tubeMat = new THREE.ShaderMaterial({
        uniforms: {
          uHead:      { value: 0 },
          uFill:      { value: 0 },
          uOpacity:   { value: 0 },
          uColor:     { value: goldColor.clone() },
          uHighlight: { value: highlight.clone() },
        },
        vertexShader: `
          attribute float aU;
          varying float vU;
          void main() {
            vU = aU;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uHead; uniform float uFill; uniform float uOpacity;
          uniform vec3 uColor; uniform vec3 uHighlight;
          varying float vU;
          void main() {
            if (vU > uHead + 0.005) discard;
            float behind = max(uHead - vU, 0.0);
            float comet = exp(-behind * 4.5);
            float fill = uFill * 0.55;
            float intensity = max(comet, fill);
            vec3 c = mix(uColor, uHighlight, clamp(comet * 0.85, 0.0, 1.0));
            float a = intensity * uOpacity;
            if (a < 0.01) discard;
            gl_FragColor = vec4(c, a);
          }
        `,
        transparent: true,
        depthWrite: false,
        depthTest: true,
        blending: THREE.AdditiveBlending,
      });
      const tube = new THREE.Mesh(tubeGeom, tubeMat);
      tube.renderOrder = 3;
      earth.add(tube);

      const pulse = new THREE.Mesh(
        new THREE.SphereGeometry(0.012, 12, 12),
        new THREE.MeshBasicMaterial({
          color: highlight,
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          depthTest: true,
        })
      );
      pulse.renderOrder = 4;
      earth.add(pulse);

      arcs.push({ tube, pulse, curve, index: i });
    });

    // Floating particles.
    let pointsObj: THREE.Points | null = null;
    if (particles) {
      const count = 160;
      const positions = new Float32Array(count * 3);
      const seeds = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        const r = 1.45 + Math.random() * 1.6;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);
        seeds[i] = Math.random();
      }
      const pGeom = new THREE.BufferGeometry();
      pGeom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      pGeom.setAttribute("seed", new THREE.BufferAttribute(seeds, 1));

      const pMat = new THREE.ShaderMaterial({
        uniforms: {
          uTime:       { value: 0 },
          uColor:      { value: new THREE.Color(goldHex) },
          uPixelRatio: { value: Math.min(2, window.devicePixelRatio || 1) },
        },
        vertexShader: `
          attribute float seed;
          varying float vSeed;
          uniform float uTime; uniform float uPixelRatio;
          void main() {
            vSeed = seed;
            vec3 p = position;
            float s = seed * 6.2831;
            p.x += sin(uTime * 0.18 + s) * 0.04;
            p.y += cos(uTime * 0.22 + s * 1.3) * 0.04;
            p.z += sin(uTime * 0.14 + s * 0.7) * 0.04;
            vec4 mvPos = modelViewMatrix * vec4(p, 1.0);
            gl_PointSize = (1.2 + 1.2 * seed) * uPixelRatio * (260.0 / -mvPos.z);
            gl_Position = projectionMatrix * mvPos;
          }
        `,
        fragmentShader: `
          uniform vec3 uColor; varying float vSeed;
          void main() {
            vec2 c = gl_PointCoord - 0.5;
            float d = length(c);
            if (d > 0.5) discard;
            float a = smoothstep(0.5, 0.0, d);
            float twinkle = 0.35 + 0.45 * vSeed;
            gl_FragColor = vec4(uColor, a * twinkle * 0.45);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      pointsObj = new THREE.Points(pGeom, pMat);
      scene.add(pointsObj);
    }

    const onResize = () => {
      width = mount.clientWidth;
      height = mount.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    const clock = new THREE.Clock();
    let raf = 0;
    let elapsed = 0;
    const startedAt = performance.now();
    const tmpV = new THREE.Vector3();
    const tmpN = new THREE.Vector3();

    const tick = () => {
      const dt = clock.getDelta();
      elapsed += dt;
      earth.rotation.y += dt * speedRef.current;

      const since = (performance.now() - startedAt) / 1000;
      const STAGGER = 0.85;
      const PULSE = 0.75;
      const HOLD = 0.30;
      const FADE = 0.55;
      const PER_ARC = PULSE + HOLD + FADE;
      const LINGER = 3.0;
      const FADE_IN = 0.12;
      const FADE_OUT = 0.6;
      const PAUSE = 1.4;
      const CYCLE = (arcs.length - 1) * STAGGER + PULSE + LINGER + PAUSE;
      const cyclePos = since % CYCLE;

      cityNodes.forEach((n, idx) => {
        if (n.city.origin) {
          const k = 0.85 + Math.sin(elapsed * 1.0) * 0.18;
          n.halo.scale.setScalar(k);
          n.halo.material.opacity = 0.42 * k;
          return;
        }
        const arcIdx = idx - 1;
        const localT = cyclePos - arcIdx * STAGGER;
        const sinceLand = localT - PULSE;
        let activation = 0;
        if (sinceLand >= 0 && sinceLand < LINGER) {
          if (sinceLand < FADE_IN) {
            activation = sinceLand / FADE_IN;
          } else if (sinceLand > LINGER - FADE_OUT) {
            activation = (LINGER - sinceLand) / FADE_OUT;
          } else {
            activation = 1;
          }
        }

        // Detect the rising edge — fire a shockwave once per landing.
        const prev = n.lastActivation ?? 0;
        if (prev <= 0.001 && activation > 0.001) {
          n.shockStart = elapsed;
        }
        n.lastActivation = activation;

        n.activation = activation;
        n.dot.material.opacity = activation;
        const breathe = 0.85 + Math.sin(elapsed * 2.0 + idx * 0.7) * 0.18;
        n.halo.scale.setScalar(0.75 + activation * 0.55 * breathe);
        n.halo.material.opacity = activation * 0.6;

        // Animate the shockwave rings + sparks for ~0.9s after landing.
        const BURST = 0.9;
        if (n.shockStart !== undefined) {
          const sp = (elapsed - n.shockStart) / BURST;
          if (sp >= 0 && sp <= 1) {
            // Eased outward expansion + opacity fade
            const ease1 = 1 - Math.pow(1 - sp, 2.4);
            const ease2 = 1 - Math.pow(1 - Math.max(0, sp - 0.18) / 0.82, 2.4);
            if (n.ring1) {
              n.ring1.scale.setScalar(0.6 + ease1 * 6.0);
              n.ring1.material.opacity = (1 - sp) * 0.85;
            }
            if (n.ring2) {
              n.ring2.scale.setScalar(0.6 + ease2 * 7.5);
              n.ring2.material.opacity = (1 - sp) * 0.55;
            }
            if (n.sparks) {
              n.sparks.material.uniforms.uProgress.value = sp;
            }
          } else {
            if (n.ring1) n.ring1.material.opacity = 0;
            if (n.ring2) n.ring2.material.opacity = 0;
            if (n.sparks) n.sparks.material.uniforms.uProgress.value = 1.0;
          }
        }
      });

      arcs.forEach((a) => {
        const localT = cyclePos - a.index * STAGGER;
        let head = 0, fill = 0, opacity = 0;
        if (localT >= 0 && localT < PULSE) {
          const u = localT / PULSE;
          head = 1 - Math.pow(1 - u, 2.2);
          opacity = Math.min(1, localT / 0.08);
          fill = 0;
        } else if (localT >= PULSE && localT < PULSE + HOLD) {
          head = 1;
          fill = (localT - PULSE) / HOLD;
          opacity = 1;
        } else if (localT >= PULSE + HOLD && localT < PER_ARC) {
          head = 1;
          fill = 1;
          opacity = 1 - (localT - PULSE - HOLD) / FADE;
        }
        const u = a.tube.material.uniforms;
        u.uHead.value = head;
        u.uFill.value = fill;
        u.uOpacity.value = Math.max(0, opacity);

        if (localT >= 0 && localT < PULSE) {
          const p = a.curve.getPointAt(Math.max(0, Math.min(1, head)));
          a.pulse.position.copy(p);
          a.pulse.material.opacity = Math.min(1, localT / 0.06) * 0.95;
          const flare = 1 + Math.pow(head, 4) * 0.6;
          a.pulse.scale.setScalar(flare);
        } else if (localT >= PULSE && localT < PULSE + 0.25) {
          const k = 1 - (localT - PULSE) / 0.25;
          const p = a.curve.getPointAt(1);
          a.pulse.position.copy(p);
          a.pulse.material.opacity = k * 0.9;
          a.pulse.scale.setScalar(1.6 + (1 - k) * 1.2);
        } else {
          a.pulse.material.opacity = 0;
        }
      });

      if (territory && territoryFadeStart) {
        const tt = (performance.now() - territoryFadeStart) / 1000;
        const opT = Math.min(1, tt / 1.2);
        const mat = territory.material as THREE.ShaderMaterial;
        mat.uniforms.uOpacity.value = 1 - Math.pow(1 - opT, 3);
        mat.uniforms.uTime.value = elapsed;
        const sweepT = Math.min(1.2, tt / 4.0);
        mat.uniforms.uReveal.value = -Math.PI + sweepT * (Math.PI * 2 + 0.6);
      }

      if (pointsObj) {
        const mat = pointsObj.material as THREE.ShaderMaterial;
        mat.uniforms.uTime.value = elapsed;
      }

      if (labelLayerRef.current) {
        const layer = labelLayerRef.current;
        const labelEls = layer.children;
        for (let i = 0; i < cityNodes.length; i++) {
          const el = labelEls[i] as HTMLElement | undefined;
          if (!el) continue;
          const node = cityNodes[i];
          tmpV.copy(node.pos).applyMatrix4(earth.matrixWorld);
          tmpN.copy(node.pos).applyQuaternion(earth.quaternion).normalize();
          const toCam = camera.position.clone().sub(tmpV).normalize();
          const facing = tmpN.dot(toCam);
          const proj = tmpV.clone().project(camera);
          const x = (proj.x * 0.5 + 0.5) * width;
          const y = (1 - (proj.y * 0.5 + 0.5)) * height;
          el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
          const facingFade = facing > 0.05 ? Math.min(1, (facing - 0.05) * 4) : 0;
          const gate = node.city.origin ? 1 : (node.activation || 0);
          el.style.opacity = (facingFade * gate).toFixed(3);
        }
      }

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const m = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (m) {
          if (Array.isArray(m)) m.forEach((mm) => mm.dispose());
          else m.dispose();
        }
      });
    };
  }, [goldHex, highlightHex, deepHex, particles, cities]);

  return (
    <div className="relative w-full h-full" style={{ minHeight: 320 }}>
      <div ref={mountRef} className="absolute inset-0" />
      {showLabels && (
        <div
          ref={labelLayerRef}
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          {cities.map((c, i) => (
            <div
              key={i}
              className="absolute top-0 left-0"
              style={{
                willChange: "transform, opacity",
                transition: "opacity 0.4s ease",
                opacity: 0,
              }}
            >
              <div
                className="relative"
                style={{
                  transform: c.origin
                    ? "translate(14px, -26px)"
                    : "translate(12px, -14px)",
                }}
              >
                {/* Connector dash — slightly bolder gradient, more visible */}
                <div
                  className="absolute"
                  style={{
                    left: -10,
                    top: c.origin ? 20 : 10,
                    width: 8,
                    height: 1.5,
                    background: c.origin
                      ? `linear-gradient(90deg, transparent, ${highlightHex})`
                      : `linear-gradient(90deg, transparent, ${goldHex})`,
                    opacity: 0.95,
                  }}
                />
                {/* City name — Soria display face, bolder, brighter */}
                <div
                  className="whitespace-nowrap"
                  style={{
                    fontFamily:
                      "var(--font-soria), var(--font-display), Georgia, serif",
                    fontSize: c.origin ? 14 : 12,
                    letterSpacing: "0.1em",
                    color: c.origin ? "#FFE7A8" : "#FFD875",
                    textTransform: "uppercase",
                    textShadow:
                      "0 0 1px rgba(0,0,0,0.95), 0 1px 8px rgba(0,0,0,0.95), 0 0 14px rgba(212,175,55,0.35)",
                    fontWeight: 400,
                    lineHeight: 1,
                  }}
                >
                  {c.name}
                </div>
                {/* Country — Jost mono, tracked, strong */}
                <div
                  className="font-jost whitespace-nowrap"
                  style={{
                    fontSize: c.origin ? 9.5 : 9,
                    letterSpacing: "0.34em",
                    color: "#F2E6CC",
                    textTransform: "uppercase",
                    marginTop: 4,
                    fontWeight: 600,
                    textShadow:
                      "0 0 1px rgba(0,0,0,0.95), 0 1px 6px rgba(0,0,0,0.95), 0 0 2px rgba(0,0,0,0.6)",
                  }}
                >
                  {c.country}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
