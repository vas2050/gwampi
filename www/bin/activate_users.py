#!/usr/local/bin/python

import pymongo;
import re;
from random import random;

client = pymongo.MongoClient('mongodb://localhost:27017/');
dblist = client.list_database_names();

print("");
if 'gwampi' in dblist:
  print(">> db.gwampi found");
  db = client['gwampi'];

  collist = db.list_collection_names();
  if 'enrolls' in collist:
    print(">> collection.enrolls found");
    enroll_col = db['enrolls'];

    query = {'approved': {'$in': ['A', 'D']}, 'activated': 'P'};
    fields = {'_id': 0, 'userid': 1, 'email': 1, 'approved': 1};

    for enroll in enroll_col.find(query, fields).sort('userid'):
      email = enroll['email'];
      userid = enroll['userid'];
      status = enroll['approved'];
      print(">> user signed up: %s" % userid);

      if 'users' in collist:
        user_col = db['users'];
        print(">> collection.users found");

        query = {'userid': {'$regex': '^' + userid + '::\d+$'}, 'email': {'$regex': '^' + email + '::\d+$'}};
        if (status == 'A'):
          for user in user_col.find(query):
            print(">> user to activate: %s, for app: %s" % (user['userid'], user['appid']));
            u_update = {'$set': { 'userid': userid, 'email': email}};
            user_col.update_one(query, u_update); 
            print(">> user activated: %s" % userid);

            if user['appid']:
              app = {
                'appid': user['appid'] + '_' + str(int(random() * pow(10, 4))),
                'name' : user['appid'],
                'desc' : user['appid'].upper(),
              };

              appid_col = db['appids'];
              appid = appid_col.find_one({'name': app['name']});
              if appid:
                appid = appid['appid'];

              if appid:
                print(">> appid %s already exists" % appid);
              else:
                appid_col.insert_one(app);
                print(">> appid created: %s" % app['appid']);
            else:
              print(">> no appid to update or create");

            e_query = {'userid': userid, 'email': email};
            e_update = {'$set': {'activated': 'A'}};
            enroll_col.update_one(e_query, e_update);
            print(">> enroll updated: %s" % userid);

        elif (status == 'D'):
          for user in user_col.find(query):
            print(">> user to delete: %s" % user['userid']);
            user_col.delete_one(query); 
            print(">> user deleted: %s" % userid);

            e_query = {'userid': userid, 'email': email};
            e_update = {'$set': {'activated': 'D'}};
            enroll_col.update_one(e_query, e_update);
            print(">> enroll updated: %s" % userid);

  print("");
