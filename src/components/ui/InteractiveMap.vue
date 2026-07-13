<script setup lang="ts">
import { ref, onMounted, shallowRef } from "vue";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import countriesData from "../../data/countries.json";
import type { CountryData } from "../../types";

// Dynamic Type Extraction
type TopoTopology = Parameters<typeof topojson.feature>[0];
type TopoGeometry = Parameters<typeof topojson.feature>[1];

interface GeoFeature {
  id: string;
  type: string;
  geometry: object;
  properties: { name: string };
}

interface MapFeature {
  id: string;
  path: string | null;
}

// Component Props & Emits
const props = defineProps<{
  highlightedIds?: string[];
  interactive?: boolean;
}>();

const emit = defineEmits<{
  (e: "country-clicked", id: string): void;
}>();

// State
const svgRef = ref<SVGSVGElement | null>(null);
const zoomTransform = ref<string>("");
const mapFeatures = shallowRef<MapFeature[]>([]);

const width = 800;
const height = 600;

const projection = d3
  .geoNaturalEarth1()
  .fitSize([width, height], { type: "Sphere" });
const pathGenerator = d3.geoPath().projection(projection);

// Text normalizer to strip spaces and accents for matching
const normalize = (str: string) => {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]/gi, "")
    .toLowerCase();
};

onMounted(async () => {
  try {
    const response = await fetch("/data/world-110m.topo.json");

    // Safely cast using the dynamically extracted types
    const topoData = (await response.json()) as TopoTopology;
    const countriesGeometry = (topoData.objects as Record<string, TopoGeometry>)
      .countries;

    const geoData = topojson.feature(
      topoData,
      countriesGeometry,
    ) as unknown as { features: GeoFeature[] };

    // Cross-reference the map name with the dictionary to extract the ISO code
    const dictionary = countriesData as CountryData[];

    mapFeatures.value = geoData.features.map((feature) => {
      const mapName = feature.properties.name || "";

      const matchedCountry = dictionary.find((c) => {
        const a = normalize(c.name);
        const b = normalize(mapName);
        return a === b || a.includes(b) || b.includes(a);
      });

      return {
        id: matchedCountry ? matchedCountry.code : mapName,
        path: pathGenerator(feature as d3.GeoPermissibleObjects),
      };
    });

    if (svgRef.value) {
      const zoom = d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([1, 8])
        .translateExtent([
          [0, 0],
          [width, height],
        ])
        .on("zoom", (event) => {
          zoomTransform.value = event.transform.toString();
        });

      d3.select(svgRef.value).call(zoom);
    }
  } catch (error) {
    console.error("Failed to load map data:", error);
  }
});

// Interaction Handlers
const handleCountryClick = (id: string) => {
  if (!props.interactive) return;
  emit("country-clicked", id);
};

const getCountryClass = (id: string) => {
  const isHighlighted = props.highlightedIds?.includes(id);

  return [
    "transition-colors duration-200 cursor-pointer outline-none stroke-white stroke-[0.5]",
    isHighlighted ? "fill-(--brand-green)" : "fill-slate-300",
    props.interactive && !isHighlighted ? "hover:fill-(--brand-primary)" : "",
  ];
};
</script>

<template>
  <div
    class="relative h-full min-h-125 w-full touch-none overflow-hidden rounded-xl border border-slate-200 bg-sky-50 shadow-inner"
  >
    <svg ref="svgRef" viewBox="0 0 800 600" class="block h-full w-full">
      <g :transform="zoomTransform">
        <path
          v-for="country in mapFeatures"
          :key="country.id"
          :d="country.path || ''"
          :class="getCountryClass(country.id)"
          @click="handleCountryClick(country.id)"
        />
      </g>
    </svg>
  </div>
</template>
