"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { markAsLearned } from "./actions";

const CATEGORY_LABELS: Record<string, string> = {
  SERVICE: "服务",
  PRODUCT: "产品",
  SALES: "销售",
  SAFETY: "安全",
};

type Standard = {
  id: string;
  name: string;
  category: string;
  description: string;
  maxScore: number;
  passScore: number;
};

type TrainingMaterial = {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  sections: {
    title: string;
    items: string[];
  }[];
  scripts?: string[];
};

const TRAINING_MATERIALS: TrainingMaterial[] = [
  {
    id: "hygiene",
    title: "极简卫生法",
    subtitle: "营业前和交接班必查",
    summary: "不要想复杂，只按两道判断题和一个陈列标准执行：镜子有没有手指印，地面有没有头发/标签纸，衣架间距能不能放进三根手指。",
    sections: [
      {
        title: "试衣间",
        items: [
          "用干抹布和毛刷，从上往下擦一遍试衣镜。",
          "站在 1 米外看镜子，只要有一个手指印就重擦。",
        ],
      },
      {
        title: "全场地面",
        items: [
          "清扫并拖完整个门店。",
          "在试衣间门口检查，看到头发团或标签纸就重扫。",
        ],
      },
      {
        title: "衣架陈列",
        items: [
          "用一只手插进衣架缝隙调整距离。",
          "两件衣服之间保持约三根手指，太挤就撤一部分到后面。",
        ],
      },
    ],
  },
  {
    id: "cashier",
    title: "收银四步法",
    subtitle: "省钱、查瑕疵、核券、加微信",
    summary: "收银不是只收钱，核心是帮顾客算清优惠、避免售后纠纷、完成复购连接。",
    sections: [
      {
        title: "1. 看标价牌",
        items: [
          "快速区分哪些衣服直接八折，哪些衣服可以用代金券。",
          "先帮顾客把优惠讲清楚，避免结账时混乱。",
        ],
      },
      {
        title: "2. 检查瑕疵",
        items: [
          "快速检查腋下、领口、粉底口红、破洞和掉线。",
          "发现问题必须提醒并立刻更换；没问题再主动给折扣。",
        ],
      },
      {
        title: "3. 核销卡券",
        items: [
          "顾客有券时先讲清核销规则。",
          "先扫码核销，确认券扣掉后，再收尾款。",
        ],
      },
      {
        title: "4. 引导加微信",
        items: [
          "支付成功后立刻引导加微信。",
          "顾客核券后可友好提醒好评有小礼品，点到为止，不强求。",
        ],
      },
    ],
    scripts: [
      "小姐姐买单是么，我帮你算一下怎么省钱！",
      "这几件是直接打八折，剩下这几件可以使用代金券。",
      "回去试穿如果不合适，微信上随时找我。朋友圈有上新，老顾客可以在线买，而且我们每天晚上还有直播，先加个微。",
    ],
  },
  {
    id: "reception",
    title: "新客/老客接待",
    subtitle: "分不清就按新客接待",
    summary: "不可冷落任何人，不可以全程进出不讲话。新客重在降低戒心，老客重在归属感和复购。",
    sections: [
      {
        title: "新客动作",
        items: [
          "进门 3 秒内说：欢迎来快猫，随便试穿，随意拍照！",
          "身边经过时一句话推新款：这一排是刚上的新款，今天还有上新价八折。",
          "试衣后或买单前按收银四步法执行，重点引导加微信。",
        ],
      },
      {
        title: "老客动作",
        items: [
          "进门热情但不夸张：美女小姐姐又来啦，这两天上了好多新款。",
          "直接指路优惠专区或新价区。",
          "提醒老顾客可到前台领小礼物，买不买都可以拿。",
        ],
      },
    ],
    scripts: [
      "欢迎来快猫，随便试穿，随意拍照！",
      "小姐姐，这一排是我们刚上的新款，今天还有上新价八折哦。",
      "美女小姐姐又来啦！这两天上了好多新款，有需要叫我哈。",
    ],
  },
  {
    id: "fitting-room",
    title: "试衣区巡场",
    subtitle: "成交转化核心动作",
    summary: "试衣区有人时，每 3-5 分钟必须到附近一次。放任不管就是白白流失成交机会。",
    sections: [
      {
        title: "巡场频率",
        items: [
          "试衣区有人时，每 3-5 分钟必须走到试衣区附近一次。",
          "顾客试衣时严禁坐在前台玩手机。",
        ],
      },
      {
        title: "巡场动作",
        items: [
          "整理试衣间外衣架，把散落衣服挂回原位。",
          "轻声询问顾客是否合适，喜欢的款式可先帮她放前台。",
          "收回不要的衣服并归位。",
        ],
      },
      {
        title: "防丢动作",
        items: [
          "顾客进试衣间前，看一眼她拿了几件衣服并心里默记。",
          "顾客出来时件数不对，必须立刻核对试衣间。",
        ],
      },
    ],
    scripts: [
      "小姐姐，合适吗？需要哪个，我帮你放前台先留着。",
      "试过不合适的衣服可以挂门口，我帮你收。",
      "如果喜欢的话，先帮你拿到前台放着哈，不然一会儿可能被别人拿走。",
      "保管好个人物品，手机包包可以放前台，有监控。",
    ],
  },
  {
    id: "idle-work",
    title: "空闲任务",
    subtitle: "没客人也有事做",
    summary: "空闲时间是内容生产和门店维护时间，不是刷抖音、追剧、打游戏时间。",
    sections: [
      {
        title: "每 1-2 小时",
        items: [
          "更新 1 条朋友圈，内容可以是新款、穿搭、促销、顾客反馈或到货。",
          "文案可以简单，不要空着不发。",
        ],
      },
      {
        title: "每天",
        items: [
          "拍店内短视频原始素材，不要求剪辑。",
          "素材包括新款展示、店内氛围、试穿效果等，传到指定云盘。",
        ],
      },
      {
        title: "每小时",
        items: [
          "巡一圈货区，检查衣架三指间距、叠放区、地面杂物。",
          "发现断码或顾客询问缺货，及时在群里报告。",
        ],
      },
    ],
  },
  {
    id: "red-lines",
    title: "高压红线",
    subtitle: "触犯就扣罚，严重辞退",
    summary: "三条红线：防偷盗、仪态、气味。每一条都和门店损耗、成交体验、品牌质感直接相关。",
    sections: [
      {
        title: "防偷盗",
        items: [
          "顾客进试衣间前，记住她拿了几件。",
          "出来时件数不对，必须马上核对试衣间并寻找顾客。",
        ],
      },
      {
        title: "仪态",
        items: [
          "门外有客人踏进店，必须立刻放下手机站起来。",
          "顾客逛店时严禁全程低头看手机。",
          "试衣区有顾客时，必须离开前台巡场。",
        ],
      },
      {
        title: "气味",
        items: [
          "严禁在收银台或店内吃强烈气味外卖。",
          "带汤水或重味餐饮去后仓、门口或远离衣服的位置吃。",
        ],
      },
    ],
  },
  {
    id: "assessment",
    title: "考核奖惩",
    subtitle: "每月统计，挂钩绩效",
    summary: "考核不看感觉，看有没有做到动作。新老客接待、试衣区巡场、内容产出、卫生、收银和红线都会被记录。",
    sections: [
      {
        title: "扣分项",
        items: [
          "顾客进店无人招呼：-10 元。",
          "试衣区有人，5 分钟未巡场：-30 元/次。",
          "当日朋友圈没发：-10 元；当日 0 条视频素材：-10 元。",
          "卫生不达标：-10 元/次。",
          "漏说加微信话术：-20 元/次；卡券核销出错：-10 元/次。",
        ],
      },
      {
        title: "激励项",
        items: [
          "朋友圈/视频素材被采用或带来引流，单条奖 20-50 元。",
          "当月零扣分 + 全勤，额外奖 100 元。",
          "理货、补货、陈列视觉效果好，当月额外奖 200 元。",
        ],
      },
    ],
  },
];

export default function TrainingClient({
  userId,
  standards,
  completedIds: initialCompletedIds,
}: {
  userId: string;
  standards: Standard[];
  completedIds: string[];
}) {
  const [completedIds, setCompletedIds] = useState(new Set(initialCompletedIds));
  const [selected, setSelected] = useState<Standard | null>(null);
  const [selectedMaterialId, setSelectedMaterialId] = useState(TRAINING_MATERIALS[0].id);
  const [marking, setMarking] = useState(false);

  const selectedMaterial =
    TRAINING_MATERIALS.find((item) => item.id === selectedMaterialId) ??
    TRAINING_MATERIALS[0];

  async function handleMarkLearned(standardId: string) {
    setMarking(true);
    const result = await markAsLearned(userId, standardId);
    setMarking(false);
    if (result.success) {
      setCompletedIds((prev) => new Set([...prev, standardId]));
      setSelected(null);
    }
  }

  const groups = standards.reduce<Record<string, Standard[]>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  return (
    <div className="p-4 space-y-6">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">培训学习</h1>
        <p className="text-xs text-gray-500">
          先熟悉基础 SOP，再完成考核标准学习。
        </p>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">基础 SOP 资料</h2>
          <span className="text-xs text-gray-400">{TRAINING_MATERIALS.length} 个模块</span>
        </div>

        <div className="-mx-4 overflow-x-auto px-4">
          <div className="flex w-max gap-2 pb-1">
            {TRAINING_MATERIALS.map((item) => {
              const active = item.id === selectedMaterial.id;
              return (
                <Button
                  key={item.id}
                  type="button"
                  size="sm"
                  variant={active ? "default" : "outline"}
                  onClick={() => setSelectedMaterialId(item.id)}
                >
                  {item.title}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4 space-y-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold">{selectedMaterial.title}</h3>
              <Badge variant="outline">{selectedMaterial.subtitle}</Badge>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {selectedMaterial.summary}
            </p>
          </div>

          <div className="space-y-3">
            {selectedMaterial.sections.map((section) => (
              <div key={section.title} className="rounded-lg border bg-gray-50 p-3">
                <h4 className="text-sm font-medium text-gray-800">{section.title}</h4>
                <ul className="mt-2 space-y-1.5">
                  {section.items.map((item) => (
                    <li key={item} className="flex gap-2 text-sm leading-relaxed text-gray-600">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-gray-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {selectedMaterial.scripts && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <h4 className="text-sm font-medium text-amber-900">必背话术</h4>
              <div className="mt-2 space-y-2">
                {selectedMaterial.scripts.map((script) => (
                  <p key={script} className="text-sm leading-relaxed text-amber-900">
                    「{script}」
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">考核标准学习</h2>

        {standards.length === 0 && (
          <div className="text-center py-12 text-gray-400">暂无培训内容</div>
        )}

        {Object.entries(groups).map(([category, items]) => (
          <div key={category}>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-semibold text-gray-700">
                {CATEGORY_LABELS[category] ?? category}
              </h3>
              <span className="text-xs text-gray-400">
                {items.filter((i) => completedIds.has(i.id)).length}/{items.length} 已完成
              </span>
            </div>
            <div className="space-y-2">
              {items.map((item) => {
                const done = completedIds.has(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelected(item)}
                    className="w-full bg-white border rounded-lg p-3 text-left hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium flex-1">{item.name}</span>
                      {done ? (
                        <Badge className="bg-green-500 hover:bg-green-500 text-xs shrink-0">
                          ✓ 已完成
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs shrink-0">
                          未学习
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        {selected && (
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>{selected.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  {CATEGORY_LABELS[selected.category] ?? selected.category}
                </Badge>
                <Badge variant="outline">满分 {selected.maxScore} 分</Badge>
                <Badge variant="outline">合格线 {selected.passScore} 分</Badge>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {selected.description}
              </p>
            </div>
            <DialogFooter className="gap-2 flex-row">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setSelected(null)}
              >
                关闭
              </Button>
              {!completedIds.has(selected.id) && (
                <Button
                  className="flex-1"
                  onClick={() => handleMarkLearned(selected.id)}
                  disabled={marking}
                >
                  {marking ? "标记中..." : "标记已学习"}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
