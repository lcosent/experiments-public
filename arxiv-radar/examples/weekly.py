"""Run a 7-day digest for frontier AI."""

from arxiv_radar.digest import build_digest
from arxiv_radar.fetch import default_window


def main():
    since, until = default_window(7)
    md = build_digest(["cs.LG", "cs.AI"], since, until)
    print(md)


if __name__ == "__main__":
    main()
