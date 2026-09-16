import type { NavigatorScreenParams } from '@react-navigation/native';
import type { Job } from '../types';

export type JobDetailParams = { job: Job };

export type HomeStackParamList = {
  Feed:
    | {
        mode?: 'startups' | 'jobs';
        startupFilters?: import('../types').StartupFilters;
        jobFilters?: import('../types').JobFilters;
      }
    | undefined;
  StartupsFilter: { filters: import('../types').StartupFilters };
  JobsFilter: { filters: import('../types').JobFilters };
  JobDetail: JobDetailParams;
};

export type WalkInsStackParamList = {
  WalkInsList: undefined;
  JobDetail: JobDetailParams;
};

export type AppliedStackParamList = {
  AppliedList: undefined;
  JobDetail: JobDetailParams;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList> | undefined;
  WalkIns: undefined;
  Applied: undefined;
  Profile: undefined;
};

export type EmployerTabParamList = {
  EmployerHome: undefined;
  EmployerPost: undefined;
  EmployerProfile: undefined;
};

export type AdminTabParamList = {
  AdminHome: undefined;
  AdminPeople: undefined;
  AdminJobs: undefined;
  AdminProfile: undefined;
};
