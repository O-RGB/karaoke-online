import CardCommon from "@/components/common/display/card";
import useConfigStore from "@/features/config/config-store";
import ProfileForm from "../form/profile";
import ProfileCard from "./profile-card";
import ModalServer from "../common/modal";
import React, { useLayoutEffect, useState } from "react";
import { API_BASE_URL } from "../config/value";
import {
  MusicCreate,
  IMusicDetails,
  ProfileDetails,
  UpdateProfileBody,
} from "../types";
import { fetchAPI } from "../lib/fetch";
import { useNotification } from "../common/notification-provider";
import MusicForm from "../form/music";
import MusicCard from "./music-card";
import Button from "@/components/common/button/button";
import { FaPlus } from "react-icons/fa";
import { IAlertCommon } from "@/components/common/alert/types/alert.type";

interface DashboardProps extends IAlertCommon {}

const Dashboard: React.FC<DashboardProps> = ({
  closeAlert,
  closeProcessing,
  setAlert,
  setProcessing,
}) => {
  const { notify } = useNotification();

  const token = useConfigStore((state) => state.config.token);
  const [profile, setProfile] = useState<ProfileDetails>();
  const [onEditing, setEditing] = useState<boolean>(false);
  const [onAddMusic, setAddMusic] = useState<boolean>(false);
  const [musicList, setMusicList] = useState<IMusicDetails[]>([]);
  const setConfig = useConfigStore((state) => state.setConfig);

  const getProfile = async () => {
    if (!token) return;

    try {
      const response = await fetchAPI<{}, ProfileDetails>(
        `${API_BASE_URL}/users/me`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      notify({ type: "info", text: "สวัสดี " + response.first_name });
      setProfile(response);
    } catch (error) {
      notify({ type: "error", text: `ผิดพลาด ${JSON.stringify(error)}` });
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
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: update,
        }
      );

      setProfile(response);
      setEditing(false);
      notify({ type: "success", text: "แก้ไขข้อมูลแล้ว" });
    } catch (error) {
      notify({ type: "error", text: `ผิดพลาด ${JSON.stringify(error)}` });
    }
  };

  const getMusicList = async () => {
    if (!token) return;

    try {
      const response = await fetchAPI<{}, IMusicDetails[]>(
        `${API_BASE_URL}/music`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMusicList(response);
    } catch (error) {
      notify({ type: "error", text: `ผิดพลาด ${JSON.stringify(error)}` });
    }
  };

  const addMusic = async (create: MusicCreate) => {
    if (!token) return;

    try {
      const response = await fetchAPI<MusicCreate, IMusicDetails>(
        `${API_BASE_URL}/music`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: create,
        }
      );
      if (response.id) {
        setAddMusic(false);
        getMusicList();
        notify({ type: "success", text: "สร้างเพลงเรียบร้อย" });
      } else {
        notify({ type: "warning", text: "สร้างเพลงไม่สำเร็จ" });
      }
    } catch (error) {
      notify({ type: "error", text: `ผิดพลาด ${JSON.stringify(error)}` });
    }
  };

  const removeMusic = async (id: string) => {
    if (!token) return;

    try {
      await fetchAPI<MusicCreate, IMusicDetails>(
        `${API_BASE_URL}/music/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setAddMusic(false);
      getMusicList();
      notify({ type: "success", text: "ลบเพลงเรียบร้อย" });
    } catch (error) {
      notify({ type: "error", text: `ผิดพลาด ${JSON.stringify(error)}` });
    }
  };

  useLayoutEffect(() => {
    getProfile();
    getMusicList();
  }, []);

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
      <ModalServer
        title="เพิ่มเพลง"
        isOpen={onAddMusic}
        onClose={() => setAddMusic(false)}
      >
        <MusicForm onSubmit={addMusic}></MusicForm>
      </ModalServer>

      <div className="flex flex-col gap-2 justify-center items-center h-full bg-gradient-to-r from-violet-600 to-indigo-600">
        <CardCommon className="max-w-md mx-2 !p-4">
          <ProfileCard
            onEdit={() => setEditing(true)}
            onLogout={() => {
              setAlert?.({
                onOk: () => {
                  closeAlert?.();
                  setConfig({ token: undefined });
                },
                title: "ยืนยันการออกจากระบบ",
                description: "กดตกลงเพิ่มออกจากระบบ",
                variant: "warning",
              });
            }}
            profile={profile}
          ></ProfileCard>
        </CardCommon>

        <CardCommon className="max-w-md !p-2 ">
          <div className="flex justify-between items-center mb-2">
            <div className="text-xs text-gray-400">เพลงของคุณ</div>
            <Button
              disabled={!profile}
              size="xs"
              onClick={() => setAddMusic(true)}
              icon={<FaPlus className="text-xs font-light"></FaPlus>}
            >
              เพิ่ม
            </Button>
          </div>
          <div className="divide-y">
            {musicList.length == 0 && (
              <div className="p-2 text-gray-200 text-xs text-center">
                ยังไม่มีเพลง
              </div>
            )}
            {musicList.map((state, index) => {
              return (
                <div key={`${index}-${state.id}`}>
                  <MusicCard
                    onDelete={removeMusic}
                    setAlert={setAlert}
                    closeAlert={closeAlert}
                    music={state}
                  ></MusicCard>
                </div>
              );
            })}
          </div>
        </CardCommon>
      </div>
    </>
  );
};

export default Dashboard;
