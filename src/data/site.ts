// 사이트 이름, 소개, 메뉴 구성은 이 파일에서 수정하면 됩니다.

export const site = {
  name: "홍길동 홈페이지",
  owner: "홍길동",
  description: "게시판, 검색, 외부 자료, 시스템 도구를 갖춘 개인 홈페이지입니다.",
  email: "hello@example.com",
  links: [{ label: "GitHub", href: "https://github.com/" }],
};

export type Section = {
  href: string;
  title: string;
  description: string;
  nav: boolean;
};

export const sections: Section[] = [
  {
    href: "/board",
    title: "게시판",
    description: "글을 쓰고 댓글로 이야기를 나눌 수 있습니다.",
    nav: true,
  },
  {
    href: "/search",
    title: "검색 · 조회",
    description: "게시글, 댓글, 회원 데이터를 조건별로 검색하고 JSON으로 내려받습니다.",
    nav: true,
  },
  {
    href: "/external",
    title: "외부 자료",
    description: "날씨, 환율, GitHub 저장소 등 외부 공개 API 데이터를 보여줍니다.",
    nav: true,
  },
  {
    href: "/tools",
    title: "시스템 도구",
    description: "JSON 정리, 인코딩, 해시 생성 같은 개발 도구와 서버 상태를 확인합니다.",
    nav: true,
  },
  {
    href: "/mypage",
    title: "마이페이지",
    description: "내 정보와 비밀번호를 바꾸고 내가 쓴 글을 확인합니다.",
    nav: false,
  },
  {
    href: "/admin",
    title: "관리자",
    description: "회원 권한과 게시글을 관리하고 사이트 통계를 확인합니다.",
    nav: false,
  },
];
