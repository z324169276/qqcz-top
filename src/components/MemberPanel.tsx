import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, X, User } from 'lucide-react';
import { useStore } from '../store/useStore';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';

interface MemberPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const avatars = ['👦', '👧', '👨', '👩', '👴', '👵', '🧑', '👱', '🤴', '👸', '🦸', '🦹', '🧙', '🧚', '🧜', '🧛'];

const MemberPanel = ({ isOpen, onClose }: MemberPanelProps) => {
  const familyId = useStore((state) => state.familyId);
  const storeMembers = useStore((state) => state.members);
  const storePoints = useStore((state) => state.points);
  const currentMemberId = useStore((state) => state.currentMemberId);
  const selectMember = useStore((state) => state.selectMember);
  const addMemberToStore = useStore((state) => state.addMember);
  const updateMemberInStore = useStore((state) => state.updateMember);
  const deleteMemberFromStore = useStore((state) => state.deleteMember);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMember, setEditingMember] = useState<typeof storeMembers[0] | null>(null);
  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState('👦');

  const addMember = async () => {
    if (!newName.trim()) {
      toast.error('请输入成员名称');
      return;
    }

    addMemberToStore(newName.trim(), newAvatar);
    toast.success('成员添加成功');
    setNewName('');
    setNewAvatar('👦');
    setShowAddForm(false);
  };

  const updateMember = async () => {
    if (!editingMember || !newName.trim()) return;

    updateMemberInStore(editingMember.id, newName.trim(), newAvatar);
    toast.success('成员信息已更新');
    setEditingMember(null);
    setNewName('');
    setNewAvatar('👦');
  };

  const deleteMember = async (memberId: string) => {
    const member = storeMembers.find(m => m.id === memberId);
    if (!member) return;
    
    const confirmed = window.confirm(`确定要删除成员"${member.name}"吗？该成员的积分将清零。`);
    if (!confirmed) return;

    deleteMemberFromStore(memberId);
    toast.success('成员已删除');
  };

  const handleSelectMember = async (memberId: string) => {
    selectMember(memberId);
    const member = storeMembers.find(m => m.id === memberId);
    if (member) {
      toast.success(`已切换到 ${member.name}`);
    }
  };

  const startEditing = (member: typeof storeMembers[0]) => {
    setEditingMember(member);
    setNewName(member.name);
    setNewAvatar(member.avatar);
  };

  const cancelEditing = () => {
    setEditingMember(null);
    setShowAddForm(false);
    setNewName('');
    setNewAvatar('👦');
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden pointer-events-auto" onClick={(e) => e.stopPropagation()}>
          <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-primary to-purple-600">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6" />
              家庭成员
            </h2>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-4 overflow-y-auto max-h-[calc(80vh-140px)]">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">切换用户</h3>
              <div className="grid grid-cols-2 gap-2">
                {storeMembers.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => handleSelectMember(member.id)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      currentMemberId === member.id
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-3xl mb-1">{member.avatar}</div>
                    <div className="font-medium text-gray-800 truncate">{member.name}</div>
                    <div className="text-sm text-gray-500">{member.points} 积分</div>
                  </button>
                ))}
              </div>
            </div>

            {editingMember ? (
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-3">编辑成员</h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-4xl">{newAvatar}</div>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-black"
                    placeholder="成员名称"
                  />
                </div>
                <div className="grid grid-cols-8 gap-2 mb-3">
                  {avatars.map((avatar) => (
                    <button
                      key={avatar}
                      onClick={() => setNewAvatar(avatar)}
                      className={`text-2xl p-2 rounded-lg ${
                        newAvatar === avatar ? 'bg-primary/20' : 'hover:bg-gray-100'
                      }`}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={cancelEditing}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg"
                  >
                    取消
                  </button>
                  <button
                    onClick={updateMember}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg"
                  >
                    保存
                  </button>
                </div>
              </div>
            ) : showAddForm ? (
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-3">添加新成员</h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-4xl">{newAvatar}</div>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-black"
                    placeholder="成员名称"
                  />
                </div>
                <div className="grid grid-cols-8 gap-2 mb-3">
                  {avatars.map((avatar) => (
                    <button
                      key={avatar}
                      onClick={() => setNewAvatar(avatar)}
                      className={`text-2xl p-2 rounded-lg ${
                        newAvatar === avatar ? 'bg-primary/20' : 'hover:bg-gray-100'
                      }`}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={cancelEditing}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg"
                  >
                    取消
                  </button>
                  <button
                    onClick={addMember}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg"
                  >
                    添加
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 mb-4">
                {storeMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{member.avatar}</div>
                      <div>
                        <div className="font-medium text-gray-800">{member.name}</div>
                        <div className="text-sm text-gray-500">{member.points} 积分</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditing(member)}
                        className="p-2 text-gray-400 hover:text-primary"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteMember(member.id)}
                        className="p-2 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!showAddForm && !editingMember && (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-primary hover:text-primary transition-colors"
              >
                <Plus className="w-5 h-5" />
                添加家庭成员
              </button>
            )}
          </div>

          <div className="p-4 bg-gray-50 border-t">
            <p className="text-xs text-gray-400 text-center">
              切换用户后，操作的积分将归属对应成员
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default MemberPanel;
