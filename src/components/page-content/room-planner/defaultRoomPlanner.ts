import { type RoomPlannerStateType } from '../../../types/roomPlannerTypes'

/* The plan a browser starts with when it has none saved, then keeps as its own. */
export const DEFAULT_ROOM_PLANNER: RoomPlannerStateType = {
  furniture: [
    { color: '#2a78d6', id: '775c6571-e90b-4fa5-96da-777e07addf19', name: 'Arcade', rects: [{ depth: 33, width: 24, x: 0, y: 0 }] },
    { color: '#eb6834', id: '212550d3-3bb2-49ce-b35d-295fe92bba7c', name: 'Queen Bunk', rects: [{ depth: 84, width: 65, x: 0, y: 0 }] },
    { color: '#1baf7a', id: 'ca159347-6cb6-4e5f-8031-a1cc04889055', name: 'Bench Table', rects: [{ depth: 55, width: 75, x: 0, y: 0 }] },
    { color: '#2a78d6', id: 'ae80066e-ce37-43aa-9281-b928d1c9e8ed', name: 'Single bunk', rects: [{ depth: 79, width: 41, x: 0, y: 0 }] },
    { color: '#eb6834', id: '7c877729-1cce-470e-9f61-6a7dbb43eea1', name: 'Full XL bunk', rects: [{ depth: 83, width: 58, x: 0, y: 0 }] },
    { color: '#1baf7a', id: 'b6dcef39-5b46-40fd-a351-d06dc5cfa5ea', name: 'King bunk', rects: [{ depth: 88, width: 76, x: 0, y: 0 }] },
    {
      color: '#eda100',
      id: '2cbadf72-a7b7-47ee-82c9-abc02d5167f6',
      name: 'Mammoth sectional',
      rects: [
        { depth: 40, width: 162.5, x: 0, y: 0 },
        { depth: 101, width: 40, x: 0, y: 0 },
        { depth: 65.5, width: 40, x: 122.5, y: 0 }
      ]
    },
    { color: '#8e44ad', id: '063d3f6d-b60d-4720-9226-70218da667e3', name: 'Mammoth ottoman', rects: [{ depth: 50, width: 50, x: 0, y: 0 }] }
  ],
  rooms: [
    {
      doors: [
        { hinge: 'start', id: '42bf5795-a3cb-4482-bc38-a5c97f76b4cf', kind: 'opening', orientation: 'horizontal', swing: 'in', width: 36, x: 105, y: 182 }
      ],
      id: '92000a07-5f23-4e7d-a2cd-941a3f4fa64b',
      name: 'Base Main',
      placements: [
        { furnitureId: 'ca159347-6cb6-4e5f-8031-a1cc04889055', id: '68f83f3b-55b1-4aed-b027-2cef113129ba', rotation: 0, x: 91, y: 0 },
        { furnitureId: '775c6571-e90b-4fa5-96da-777e07addf19', id: '32b0173f-f2f9-4d86-91b1-f20220342a27', rotation: 0, x: 185, y: 0 }
      ],
      rects: [
        { depth: 116, width: 105, x: 0, y: 66 },
        { depth: 66, width: 118, x: 91, y: 0 },
        { depth: 116, width: 104, x: 105, y: 66 }
      ]
    },
    {
      doors: [
        { hinge: 'end', id: '7dc12d70-ab86-47a7-9888-3bfe55d69c89', kind: 'swing', orientation: 'horizontal', swing: 'in', width: 32, x: 110, y: 132 }
      ],
      id: '518ceaf6-7a06-4d67-9b3c-b811d3fa6271',
      name: 'Base 1',
      placements: [
        { furnitureId: '212550d3-3bb2-49ce-b35d-295fe92bba7c', id: 'd3ac799d-602a-4f86-a4d7-b88e63546afa', rotation: 90, x: 0, y: 0 },
        { furnitureId: 'ae80066e-ce37-43aa-9281-b928d1c9e8ed', id: 'bc93d0c2-1758-45c0-b3b2-d506f95a80c8', rotation: 270, x: 0, y: 91 }
      ],
      rects: [
        { depth: 132, width: 126, x: 0, y: 0 },
        { depth: 86, width: 16, x: 126, y: 46 }
      ]
    },
    {
      doors: [
        { hinge: 'start', id: '8b4c6e9d-c27a-4bcc-9b52-e58acc7e3242', kind: 'swing', orientation: 'horizontal', swing: 'in', width: 32, x: 0, y: 130 }
      ],
      id: 'c981d199-baba-452d-9e42-b8c988319841',
      name: 'Base 2',
      placements: [
        { furnitureId: '212550d3-3bb2-49ce-b35d-295fe92bba7c', id: '302e86ab-bea2-4c9a-a972-ec37bc2c5400', rotation: 0, x: 75, y: 0 },
        { furnitureId: 'ae80066e-ce37-43aa-9281-b928d1c9e8ed', id: 'e2bf41d5-cf6b-45b3-b838-093c43a3f266', rotation: 0, x: 0, y: 0 }
      ],
      rects: [{ depth: 130, width: 140, x: 0, y: 0 }]
    },
    {
      doors: [
        { hinge: 'start', id: '61d63965-9251-42f2-b5bc-e9a6ac465146', kind: 'swing', orientation: 'horizontal', swing: 'in', width: 32, x: 0, y: 122 }
      ],
      id: '4d10f485-cb87-4c8c-9b52-da1a491a4f55',
      name: 'Master',
      placements: [
        { furnitureId: 'b6dcef39-5b46-40fd-a351-d06dc5cfa5ea', id: '2900b96c-778f-4fbd-8744-0add5e8f34d1', rotation: 90, x: 53, y: 20 }
      ],
      rects: [{ depth: 122, width: 141, x: 0, y: 0 }]
    },
    {
      doors: [
        { hinge: 'end', id: '56685a0a-8861-4bf7-ad06-0df0efa1c43a', kind: 'swing', orientation: 'horizontal', swing: 'in', width: 32, x: 90, y: 125 }
      ],
      id: '08a85261-35d7-45cd-b229-8039569a9dfd',
      name: 'Office',
      placements: [
        { furnitureId: '212550d3-3bb2-49ce-b35d-295fe92bba7c', id: '4d799876-5cb4-4bc6-87c0-4e42142675bb', rotation: 0, x: 0, y: 0 }
      ],
      rects: [{ depth: 125, width: 122, x: 0, y: 0 }]
    }
  ],
  selectedRoomId: '92000a07-5f23-4e7d-a2cd-941a3f4fa64b'
}
