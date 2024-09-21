from typing import List, Dict


class FourYearPlan:
    def __init__(self, name: str, major: str, unassigned: List[str], year_one_sem_one: List[str],
                 year_one_sem_two: List[str], year_two_sem_one: List[str], year_two_sem_two: List[str],
                 year_three_sem_one: List[str], year_three_sem_two: List[str], year_four_sem_one: List[str],
                 year_four_sem_two: List[str], elective_reqs: Dict[str, Dict]):
        self.name = name
        self.major = major
        self.unassigned = unassigned
        self.year_one_sem_one = year_one_sem_one
        self.year_one_sem_two = year_one_sem_two
        self.year_two_sem_one = year_two_sem_one
        self.year_two_sem_two = year_two_sem_two
        self.year_three_sem_one = year_three_sem_one
        self.year_three_sem_two = year_three_sem_two
        self.year_four_sem_one = year_four_sem_one
        self.year_four_sem_two = year_four_sem_two
        self.elective_reqs = elective_reqs


def new_four_year_plan(name = None, major = None, unassigned = [], year_one_sem_one = [],
                       year_one_sem_two = [], year_two_sem_one = [], year_two_sem_two = [],
                       year_three_sem_one = [], year_three_sem_two = [], year_four_sem_one = [],
                       year_four_sem_two = [], elective_reqs={}):
    if elective_reqs is None:
        elective_reqs = {}
    return FourYearPlan(name=name, major=major, unassigned=unassigned, year_one_sem_one=year_one_sem_one,
                        year_one_sem_two=year_one_sem_two, year_two_sem_one=year_two_sem_one, year_two_sem_two=year_two_sem_two,
                        year_three_sem_one=year_three_sem_one, year_three_sem_two=year_three_sem_two, year_four_sem_one=year_four_sem_one,
                        year_four_sem_two=year_four_sem_two, elective_reqs=elective_reqs)