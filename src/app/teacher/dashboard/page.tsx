"use client";

import ActivitiesChart from "@/components/teacher/dashboard/ActivitiesChart";
import CommunityRankings from "@/components/teacher/dashboard/CommunityRankings";
import CompletedCourses from "@/components/teacher/dashboard/CompletedCourses";
import DashboardHeader from "@/components/teacher/dashboard/DashboardHeader";
import MyCourse from "@/components/teacher/dashboard/MyCourse";
import StatisticsChart from "@/components/teacher/dashboard/StatisticsChart";
import { useAuth } from "@/hooks/use-auth";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const userName = user?.name || "Teacher";
  
  return (
    <div className="container mx-auto">
      <DashboardHeader userName={userName} />
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column */}
        <div className="col-span-1 space-y-8 lg:col-span-2">
          <ActivitiesChart />
          <CommunityRankings />
        </div>
        
        {/* Right Column */}
        <div className="col-span-1 space-y-8">
          <StatisticsChart />
          <MyCourse />
          <CompletedCourses />
        </div>
      </div>
    </div>
  );
}
