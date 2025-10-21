"use client";

import React, { useLayoutEffect, useState } from "react";
import useConfigStore from "@/features/config/config-store";
import { API_BASE_URL } from "../config/value";
import { ProfileDetails, UpdateProfileBody } from "../types";
import { fetchAPI } from "../lib/fetch";
import { useNotification } from "../common/notification-provider";
import { IAlertCommon } from "@/components/common/alert/types/alert.type";

// Import Components ที่จะสร้างขึ้นมาใหม่
import ProfileCard from "./profile-card";
import ModalServer from "../common/modal";
import ProfileForm from "../form/profile";
import MyMusicTab from "./my-music";

// --- Enum สำหรับจัดการ Tab ---
enum DashboardTab {
  MyMusic = "เพลงของฉัน",
}

const Dashboard: React.FC<IAlertCommon> = ({ setAlert, closeAlert }) => {
  const { notify } = useNotification();
  const token = useConfigStore((state) => state.config.token);
  const setConfig = useConfigStore((state) => state.setConfig);

  const [profile, setProfile] = useState<ProfileDetails>();
  const [onEditing, setEditing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>(
    DashboardTab.MyMusic
  );

  const getProfile = async () => {
    if (!token) return;
    try {
      const response = await fetchAPI<{}, ProfileDetails>(
        `${API_BASE_URL}/users/me`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setProfile(response);
    } catch (error) {
      notify({ type: "error", text: `เกิดข้อผิดพลาดในการโหลดโปรไฟล์` });
    }
  };

  const updateProfile = async (update: UpdateProfileBody) => {
    if (!token) return;
    try {
      const response = await fetchAPI<UpdateProfileBody, ProfileDetails>(
        `${API_BASE_URL}/users/me`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: update,
        }
      );
      setProfile(response);
      setEditing(false);
      notify({ type: "success", text: "แก้ไขข้อมูลแล้ว" });
    } catch (error) {
      notify({ type: "error", text: `ผิดพลาด: ${JSON.stringify(error)}` });
    }
  };

  useLayoutEffect(() => {
    getProfile();
  }, []);

  const onLogout = () => {
    setAlert?.({
      onOk: () => {
        closeAlert?.();
        setConfig({ token: undefined });
      },
      title: "ยืนยันการออกจากระบบ",
      description: "กดตกลงเพื่อออกจากระบบ",
      variant: "warning",
    });
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case DashboardTab.MyMusic:
      default:
        return <MyMusicTab setAlert={setAlert} closeAlert={closeAlert} />;
    }
  };

  return (
    <>
      <ModalServer
        title="แก้ไขข้อมูลผู้ใช้"
        isOpen={onEditing}
        onClose={() => setEditing(false)}
      >
        {profile && (
          <ProfileForm onSubmit={updateProfile} value={profile}></ProfileForm>
        )}
      </ModalServer>

      <div className="flex flex-col h-full bg-gray-50">
        {/* --- ส่วนโปรไฟล์ --- */}
        <div className="p-4 border-b bg-white">
          <ProfileCard
            onEdit={() => setEditing(true)}
            onLogout={onLogout}
            profile={profile}
          />
        </div>

        {/* --- ส่วน Tab --- */}
        <div className="flex border-b bg-white">
          {Object.values(DashboardTab).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-4 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-blue-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* --- ส่วนแสดงผลเนื้อหาของ Tab --- */}
        <div className="flex-1 overflow-y-auto p-4">{renderActiveTab()}</div>
      </div>
    </>
  );
};

export default Dashboard;
