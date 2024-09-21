# major_service.py


class MajorService:
    def __init__(self, db):
        """
        Initialize the MajorService with a database connection.
        :param db: Instance of MongoDB.
        """
        self.db = db

    def get_major(self, uqid: str):
        """
        Retrieve a major by its unique identifier (uqid).
        :param uqid: The unique identifier of the course.
        :return: The major document if found, else None.
        """
        query = {"uqid": uqid}
        resp = self.db.find("Majors", query)
        if not resp:
            return None
        return resp[0]

    def get_major_by_name(self, full_name: str):
        """
        Retrieve a major by its unique identifier (uqid).
        :param full_name: The unique identifier of the course.
        :return: The major document if found, else None.
        """
        query = {"Full-Name": full_name}
        resp = self.db.find("Majors", query)
        if not resp:
            return None
        return resp[0]
