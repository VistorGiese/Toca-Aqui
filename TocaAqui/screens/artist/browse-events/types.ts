import { BandApplication } from "@/http/bandApplicationService";
import { FILTER_TABS } from "./constants";

export type FilterTab = (typeof FILTER_TABS)[number];

export type ApplicationStatusMap = Record<number, BandApplication["status"]>;
